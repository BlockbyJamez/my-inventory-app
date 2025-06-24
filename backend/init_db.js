// node_modules/init_db.js

import sqlite3 from "sqlite3";
sqlite3.verbose();

// 建立 SQLite 連線（檔案不存在會自動建立）
const db = new sqlite3.Database("products.db");

db.serialize(() => {
  // ✅ 先刪掉舊表（可選）
  db.run(`DROP TABLE IF EXISTS products`);

  // ✅ 建立新表，包含完整欄位
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stock INTEGER NOT NULL,
      price REAL DEFAULT 0,
      category TEXT,
      description TEXT,
      image TEXT
    )
  `);

  // ✅ 插入一些範例資料
  db.run(
    `INSERT INTO products (name, stock, price, category, description, image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      "MacBook Pro",
      5,
      45000,
      "Laptop",
      "Apple high-end laptop.",
      "https://example.com/macbook.jpg"
    ]
  );

  db.run(
    `INSERT INTO products (name, stock, price, category, description, image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      "iPhone 15",
      10,
      35000,
      "Phone",
      "Apple flagship smartphone.",
      "https://example.com/iphone15.jpg"
    ]
  );
});

db.close();
console.log("✅ SQLite DB 已重新建立 & 初始資料 OK");
