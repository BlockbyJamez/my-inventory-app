// backend/init_db.js
import path from "path"

import sqlite3 from "sqlite3"
sqlite3.verbose()

const dbPath = path.resolve("products.db")
console.log("✅ 目前連線的資料庫：", dbPath)
const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  console.log("📦 準備建立資料表...")

  // ✅ 建立 products 表（不重建）
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
  `)

  // ✅ 建立 users 表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `)

  // ✅ 插入初始資料（僅第一次）
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("❌ 查詢 products 失敗", err)
      return
    }

    if (row.count === 0) {
      console.log("🛒 插入預設商品資料...")
      const insertProduct = db.prepare(`
        INSERT INTO products (name, stock, price, category, description, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      insertProduct.run(
        "MacBook Pro", 5, 45000, "Laptop",
        "Apple high-end laptop.", "https://example.com/macbook.jpg"
      )

      insertProduct.run(
        "iPhone 15", 10, 35000, "Phone",
        "Apple flagship smartphone.", "https://example.com/iphone15.jpg"
      )

      insertProduct.finalize()
    } else {
      console.log("✅ products 資料已存在，跳過插入")
    }
  })

  // ✅ 插入預設帳號（只插一次）
  db.run(`
    INSERT OR IGNORE INTO users (username, password)
    VALUES (?, ?)`,
    ['admin', '1234']
  )
})

db.close(() => {
  console.log("✅ SQLite 初始化完成")
})
