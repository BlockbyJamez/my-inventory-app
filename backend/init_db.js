import sqlite3 from "sqlite3";
sqlite3.verbose();

// 建立 SQLite 連線（檔案不存在會自動建立）
const db = new sqlite3.Database("products.db");

// 建表
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stock INTEGER NOT NULL
    )
  `);

  // 可以先加一些初始資料（可選）
  db.run(`INSERT INTO products (name, stock) VALUES (?, ?)`, [
    "MacBook Pro",
    5,
  ]);
  db.run(`INSERT INTO products (name, stock) VALUES (?, ?)`, ["iPhone 15", 10]);
});

db.close();
console.log("✅ SQLite DB 已建立 & 初始資料 OK");
