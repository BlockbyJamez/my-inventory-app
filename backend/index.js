import express from "express";
import cors from "cors";
import Database from 'better-sqlite3';
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import timeout from "connect-timeout";

sqlite3.verbose();
const app = express();
const port = 3000;

// === Middleware 設定 ===
app.use(cors());
app.use(express.json());
app.use(timeout("10s"));

// === 檔案上傳資料夾準備 ===
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

// === 資料庫連線 ===
const db = new Database('MYDB.db');

// === 操作紀錄工具函式 ===
function logAction(username, action, details = null) {
  db.run(
    `INSERT INTO logs (username, action, details) VALUES (?, ?, ?)`,
    [username, action, details ? JSON.stringify(details) : null],
    (err) => {
      if (err) console.error("❌ 操作紀錄寫入失敗:", err);
    }
  );
}

// === 健康檢查 API ===
app.get("/ping", (req, res) => {
  res.send("pong");
});

// === 權限中介函式（含錯誤保護） ===
function checkAdmin(req, res, next) {
  try {
    const role = req.headers["x-role"];
    if (role !== "admin") {
      return res.status(403).json({ error: "只有管理員可執行此操作" });
    }
    next();
  } catch (err) {
    next(err);
  }
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
  const username = req.headers["x-username"] || "unknown";

  db.run(
    `INSERT INTO products (name, stock, price, category, description, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, stock, price, category, description, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      logAction(username, "add_product", { id: this.lastID, name });
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
  const username = req.headers["x-username"] || "unknown";

  db.run(
    `UPDATE products SET name = ?, stock = ?, price = ?, category = ?, description = ?, image = ? WHERE id = ?`,
    [name, stock, price, category, description, image, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Product not found" });

      logAction(username, "update_product", {
        id: Number(req.params.id),
        name,
        stock,
        price,
        category,
        description,
        image,
      });
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
  const username = req.headers["x-username"] || "unknown";

  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Product not found" });

    logAction(username, "delete_product", { id: Number(req.params.id) });
    res.json({ id: Number(req.params.id) });
  });
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// === Auth APIs ===
app.post("/api/login", (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "帳號與密碼不得為空" });

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return next(err);

    if (row) {
      logAction(username, "login_success", { username });
      res.json({ success: true, username: row.username, role: row.role });
    } else {
      res.status(401).json({ error: "帳號或密碼錯誤" });
    }
  });
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

    logAction(username, "register_user", { username });
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

      transporter.sendMail(mailOptions, (error) => {
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

// === 日誌查詢 API ===
app.get("/logs", checkAdmin, (req, res) => {
  db.all(
    `SELECT id, username, action, details, timestamp FROM logs ORDER BY timestamp DESC LIMIT 100`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: "查詢失敗" });
      res.json(rows);
    }
  );
});

// === 出入庫 APIs ===
app.post("/transactions", checkAdmin, (req, res) => {
  const { product_id, type, quantity, note } = req.body;
  const operator = req.headers["x-username"] || "unknown";

  if (!product_id || !type || !quantity || !["in", "out"].includes(type)) {
    return res.status(400).json({ error: "參數錯誤" });
  }

  const updateSql = type === "in"
    ? `UPDATE products SET stock = stock + ? WHERE id = ?`
    : `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`;

  const updateParams = type === "in"
    ? [quantity, product_id]
    : [quantity, product_id, quantity];

  db.get(`SELECT name FROM products WHERE id = ?`, [product_id], (err, row) => {
    const productName = row?.name || `ID ${product_id}`;

    db.run(updateSql, updateParams, function (err) {
      if (err) return res.status(500).json({ error: "更新庫存失敗" });
      if (this.changes === 0) return res.status(400).json({ error: "庫存不足或商品不存在" });

      db.run(
        `INSERT INTO transactions (product_id, type, quantity, note, operator) VALUES (?, ?, ?, ?, ?)`,
        [product_id, type, quantity, note, operator],
        function (err) {
          if (err) return res.status(500).json({ error: "交易紀錄新增失敗" });

          logAction(operator, "add_transaction", {
            product_id,
            type,
            quantity,
            productName
          });

          res.status(201).json({ success: true, transaction_id: this.lastID });
        }
      );
    });
  });
});

app.get("/transactions", (req, res) => {
  db.all(`
    SELECT t.*, p.name AS product_name
    FROM transactions t
    JOIN products p ON t.product_id = p.id
    ORDER BY t.timestamp DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: "查詢失敗" });
    res.json(rows);
  });
});

// === 使用者權限管理 APIs（僅限 admin） ===

// 查詢所有使用者（不包含密碼與驗證碼等機密資訊）
app.get("/users", checkAdmin, (req, res) => {
  db.all(`SELECT id, username, email, role FROM users`, (err, rows) => {
    if (err) return res.status(500).json({ error: "查詢使用者失敗" });
    res.json(rows);
  });
});

// 修改指定使用者的角色
app.put("/users/:id/role", checkAdmin, (req, res) => {
  const { role } = req.body;
  const validRoles = ["admin", "viewer"];
  const currentUser = req.headers["x-username"] || "unknown";

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "角色不合法" });
  }

  db.get(`SELECT username FROM users WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "找不到使用者" });

    if (row.username === currentUser && role !== "admin") {
      return res.status(403).json({ error: "不能將自己的權限改為 viewer" });
    }

    db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id], function (err) {
      if (err) return res.status(500).json({ error: "更新角色失敗" });
      if (this.changes === 0) return res.status(404).json({ error: "找不到使用者" });

      logAction(currentUser, "update_permissions", {
        username: row.username,
        newRole: role
      });

      res.json({ success: true });
    });
  });
});

// === 全域錯誤處理（最底層一定要放） ===
app.use((err, req, res, next) => {
  console.error("🔥 全域錯誤攔截器：", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "系統內部錯誤" });
});

// === 啟動伺服器 ===
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});
