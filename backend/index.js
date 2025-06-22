import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
sqlite3.verbose();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 建立 DB 連線
const db = new sqlite3.Database("products.db");

// ✅ GET 所有產品
app.get("/products", (req, res) => {
  db.all(`SELECT * FROM products`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// ✅ GET 單一產品
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

// ✅ POST 新增產品
app.post("/products", (req, res) => {
  const { name, stock } = req.body;
  db.run(
    `INSERT INTO products (name, stock) VALUES (?, ?)`,
    [name, stock],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, name, stock });
      }
    }
  );
});

// ✅ PUT 更新產品
app.put("/products/:id", (req, res) => {
  const id = req.params.id;
  const { name, stock } = req.body;
  db.run(
    `UPDATE products SET name = ?, stock = ? WHERE id = ?`,
    [name, stock, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.json({ id: Number(id), name, stock });
      }
    }
  );
});

// ✅ DELETE 刪除產品
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

// 啟動 Server
app.listen(port, () => {
  console.log(`✅ Backend running with SQLite on http://localhost:${port}`);
});
