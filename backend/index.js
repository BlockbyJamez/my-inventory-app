import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

sqlite3.verbose();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

const db = new sqlite3.Database("MYDB.db");

// ✅ 權限檢查中介函式
function checkAdmin(req, res, next) {
  const role = req.headers["x-role"];
  if (role !== "admin") {
    return res.status(403).json({ error: "只有管理員可執行此操作" });
  }
  next();
}

// === Product APIs ===

app.get("/products", (req, res) => {
  db.all(`SELECT * FROM products`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/products/:id", (req, res) => {
  db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) res.json(row);
    else res.status(404).json({ error: "Product not found" });
  });
});

app.post("/products", checkAdmin, (req, res) => {
  const { name, stock, price, category, description, image } = req.body;
  db.run(
    `INSERT INTO products (name, stock, price, category, description, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, stock, price, category, description, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        name,
        stock,
        price,
        category,
        description,
        image,
      });
    }
  );
});

app.put("/products/:id", checkAdmin, (req, res) => {
  const { name, stock, price, category, description, image } = req.body;
  db.run(
    `UPDATE products SET name = ?, stock = ?, price = ?, category = ?, description = ?, image = ? WHERE id = ?`,
    [name, stock, price, category, description, image, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Product not found" });
      res.json({
        id: Number(req.params.id),
        name,
        stock,
        price,
        category,
        description,
        image,
      });
    }
  );
});

app.delete("/products/:id", checkAdmin, (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json({ id: Number(req.params.id) });
  });
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ imageUrl });
});

// === User/Auth APIs ===

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "帳號與密碼不得為空" });
  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: "伺服器錯誤" });
      if (row)
        res.json({
          success: true,
          username: row.username,
          role: row.role, // ✅ 回傳角色
        });
      else res.status(401).json({ error: "帳號或密碼錯誤" });
    }
  );
});

app.post("/api/register", (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ error: "帳號、密碼與信箱不得為空" });
  const sql = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, 'viewer')`;
  db.run(sql, [username, password, email], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed"))
        return res.status(409).json({ error: "帳號已存在" });
      return res.status(500).json({ error: "伺服器錯誤" });
    }
    res.status(201).json({ success: true, userId: this.lastID });
  });
});

app.post("/api/forgot-password", (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: "請提供帳號" });
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [identifier],
    (err, user) => {
      if (err || !user) return res.status(404).json({ error: "查無此帳號" });
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 60 * 1000;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "danny90628@gmail.com",
          pass: "dnndvufcudqjdckn",
        },
      });

      const mailOptions = {
        from: '"MY系統客服" <danny90628@gmail.com>',
        to: user.email,
        subject: "密碼重設驗證碼",
        text: `您好，您的驗證碼為：${code}，1 分鐘內有效。\n帳號：${user.username}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).json({ error: "寄信失敗" });
        db.run(
          `UPDATE users SET email_verification_code = ?, email_code_expires = ? WHERE id = ?`,
          [code, expires, user.id],
          (err) => {
            if (err) return res.status(500).json({ error: "驗證碼儲存失敗" });
            res.json({ message: "已發送驗證碼至註冊信箱" });
          }
        );
      });
    }
  );
});

app.post("/api/verify-code", (req, res) => {
  const { username, code } = req.body;
  if (!username || !code)
    return res.status(400).json({ error: "缺少帳號或驗證碼" });

  db.get(
    `SELECT * FROM users WHERE username = ? AND email_verification_code = ? AND email_code_expires > ?`,
    [username, code, Date.now()],
    (err, user) => {
      if (err || !user)
        return res.status(400).json({ error: "驗證碼錯誤或已過期" });
      res.json({ message: "驗證成功，請繼續設定新密碼", token: code });
    }
  );
});

app.post("/api/reset-password", (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword)
    return res.status(400).json({ error: "缺少驗證碼或新密碼" });

  db.get(
    `SELECT * FROM users WHERE email_verification_code = ? AND email_code_expires > ?`,
    [code, Date.now()],
    (err, user) => {
      if (err || !user)
        return res.status(400).json({ error: "驗證碼錯誤或已過期" });

      db.run(
        `UPDATE users SET password = ?, email_verification_code = NULL, email_code_expires = NULL WHERE id = ?`,
        [newPassword, user.id],
        (err) => {
          if (err) return res.status(500).json({ error: "更新密碼失敗" });
          res.json({ message: "密碼重設成功，請重新登入" });
        }
      );
    }
  );
});

app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});
