import path from "path";
import sqlite3 from "sqlite3";
sqlite3.verbose();

const dbPath = path.resolve("MYDB.db");
console.log("✅ 目前連線的資料庫：", dbPath);
const db = new sqlite3.Database(dbPath);

// ✅ 建立資料表（若不存在）
db.serialize(() => {
  console.log("📦 準備建立資料表...");

  // 產品表
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

  // 使用者表（基本欄位）
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // ✅ 檢查欄位是否存在，缺少就補上
  const userColumns = [
    { name: "email", type: "TEXT" },
    { name: "role", type: "TEXT DEFAULT 'viewer'" },
    { name: "email_verification_code", type: "TEXT" },
    { name: "email_code_expires", type: "INTEGER" },
    { name: "reset_token", type: "TEXT" },
    { name: "reset_expires", type: "INTEGER" },
  ];

  userColumns.forEach(({ name, type }) => {
    db.get(
      `SELECT COUNT(*) as count FROM pragma_table_info('users') WHERE name = ?`,
      [name],
      (err, row) => {
        if (err) {
          console.error(`❌ 查詢欄位 ${name} 失敗`, err);
        } else if (row.count === 0) {
          db.run(`ALTER TABLE users ADD COLUMN ${name} ${type}`, (err) => {
            if (err) {
              console.error(`❌ 新增欄位 ${name} 失敗`, err);
            } else {
              console.log(`✅ 已新增欄位：${name}`);
            }
          });
        }
      }
    );
  });

  // 出入庫紀錄表
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('in', 'out')) NOT NULL,
      quantity INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      note TEXT,
      operator TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `, (err) => {
    if (err) {
      console.error("❌ 建立 transactions 表失敗", err);
    } else {
      console.log("✅ 出入庫紀錄表 transactions 建立完成");
    }
  });

  // ✅ 檢查 transactions 是否已有 operator 欄位，若無則補上
  db.get(`SELECT COUNT(*) as count FROM pragma_table_info('transactions') WHERE name = 'operator'`, (err, row) => {
    if (!err && row.count === 0) {
      db.run(`ALTER TABLE transactions ADD COLUMN operator TEXT`, (err) => {
        if (err) console.error("❌ 新增 operator 欄位失敗", err);
        else console.log("✅ 已新增欄位：operator");
      });
    }
  });

    // 操作記錄表（logs）
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("❌ 建立 logs 表失敗", err);
    } else {
      console.log("✅ 操作記錄表 logs 建立完成");
    }
  });

  // ✅ 若產品為空，就插入預設資料
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("❌ 查詢 products 失敗", err);
      db.close();
      return;
    }

    if (row.count === 0) {
      console.log("🛒 插入預設商品資料...");
      const insertProduct = db.prepare(`
        INSERT INTO products (name, stock, price, category, description, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertProduct.run(
        "MacBook Pro",
        5,
        45000,
        "Laptop",
        "Apple high-end laptop.",
        "https://example.com/macbook.jpg"
      );

      insertProduct.run(
        "iPhone 15",
        10,
        35000,
        "Phone",
        "Apple flagship smartphone.",
        "https://example.com/iphone15.jpg"
      );

      insertProduct.finalize((err) => {
        if (err) console.error("❌ finalize 失敗", err);
        insertDefaultUser();
      });
    } else {
      console.log("✅ products 資料已存在，跳過插入");
      insertDefaultUser();
    }
  });
});

// ✅ 插入預設 admin 使用者（不覆蓋）
function insertDefaultUser() {
  db.run(
    `
    INSERT OR IGNORE INTO users (username, password, email, role)
    VALUES (?, ?, ?, ?)`,
    ["admin", "1234", "danny90628@gmail.com", "admin"],
    (err) => {
      if (err) {
        console.error("❌ 插入預設使用者失敗", err);
      } else {
        console.log("✅ 預設帳號 admin 建立完成（或已存在）");
      }
      db.close(() => {
        console.log("✅ SQLite 初始化完成");
      });
    }
  );
}
