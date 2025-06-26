// node_modules/index.js

import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import multer from "multer";
import path from "path";
import fs from "fs";

sqlite3.verbose();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ [NEW] 建立 uploads 資料夾（若不存在）
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ [NEW] 設定 multer 存檔邏輯
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ [NEW] 提供 uploads 靜態路徑
app.use('/uploads', express.static(uploadDir));

// ========================================================

// 建立 DB 連線
const db = new sqlite3.Database("products.db");

// GET 所有產品
app.get("/products", (req, res) => {
  db.all(`SELECT * FROM products`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// GET 單一產品
app.get("/products/:id", (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });
});

// POST 新增產品
app.post("/products", (req, res) => {
  const { name, stock, price, category, description, image } = req.body;
  db.run(
    `INSERT INTO products (name, stock, price, category, description, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, stock, price, category, description, image],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({
          id: this.lastID,
          name,
          stock,
          price,
          category,
          description,
          image
        });
      }
    }
  );
});

// PUT 更新產品
app.put("/products/:id", (req, res) => {
  const id = req.params.id;
  const { name, stock, price, category, description, image } = req.body;
  db.run(
    `UPDATE products SET name = ?, stock = ?, price = ?, category = ?, description = ?, image = ? WHERE id = ?`,
    [name, stock, price, category, description, image, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.json({
          id: Number(id),
          name,
          stock,
          price,
          category,
          description,
          image
        });
      }
    }
  );
});

// DELETE 刪除產品
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json({ id: Number(id) });
    }
  });
});

// [NEW] 上傳圖片 API
app.post("/upload", upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // 最佳寫法: 不要硬編 Port, 自動抓 host
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// ✅ 登入 API（帳號密碼驗證）
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '帳號與密碼不得為空' });
  }

  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: '伺服器錯誤' });
      }

      if (row) {
        return res.json({ success: true, username: row.username });
      } else {
        return res.status(401).json({ error: '帳號或密碼錯誤' });
      }
    }
  );
});

// ✅ 註冊 API（新增使用者）
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '帳號與密碼不得為空' });
  }

  const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;

  db.run(sql, [username, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: '帳號已存在' });
      }
      return res.status(500).json({ error: '伺服器錯誤' });
    }

    return res.status(201).json({ success: true, userId: this.lastID });
  });
});

// 啟動 Server
app.listen(port, () => {
  console.log(`✅ Backend running with SQLite + file upload on http://localhost:${port}`);
});
