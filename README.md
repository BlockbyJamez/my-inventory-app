# 📦 我的庫存系統 (My Inventory System)

這是一個簡易的商品庫存與帳號管理系統，採用 **Vue 3 + Express + RESTful API** 架構開發，前後端分離，支援圖片上傳、帳號登入驗證與庫存維護，**並支援角色權限控管、忘記密碼驗證流程與出入庫管理記錄**，作為全端作品集展示。

---

## 🧰 使用技術

| 區塊 | 技術                                                 |
| ---- | ---------------------------------------------------- |
| 前端 | Vue 3, Element Plus, Pinia, Vue Router, Fetch API    |
| 後端 | Node.js, Express, SQLite3                            |
| 工具 | concurrently, multer (圖片上傳), nodemon, nodemailer |

---

## 📸 功能介紹

### ✅ 商品功能（已完成）

- 商品列表與圖片顯示
- 商品新增 / 編輯 / 刪除
- 支援圖片上傳與預覽
- 依名稱模糊搜尋、分類篩選
- 分頁顯示 (5 筆/頁)
- 欄位排序（價格、分類、ID 等）
- 📊 統計資訊顯示（商品總數、總價值、分類統計）
- 🧮 出入庫記錄功能（進行中）

### ✅ 使用者功能（已完成）

- 使用者註冊（帳號、密碼、Email）
- 登入驗證（帳密比對）
- 忘記密碼：
  - 寄送 6 碼 Email 驗證碼
  - 驗證碼 1 分鐘內有效
  - 驗證成功後可重新設定密碼
- 角色系統（admin / viewer）：
  - admin 可管理商品與權限
  - viewer 僅可檢視商品資料

### ✅ 系統整合（已完成）

- RESTful API 設計
- 支援圖片上傳與靜態資源存取
- 支援前後端同時啟動 (`npm run dev`)
- 權限驗證：後端 API 會根據登入角色驗證可執行操作

---

## 📂 專案結構

```
my-inventory-app/
├── backend/ # Node.js Express API
│ ├── index.js # 主後端伺服器
│ ├── init_db.js # 資料表初始化（包含商品與使用者表）
│ ├── MYDB.db # SQLite 資料庫檔案
│ └── uploads/ # 上傳圖片存放處
├── frontend/
│ └── src/
│ └── views/ # 包含 Login / Register / Product / Permission / Log 等頁面
├── package.json # 專案啟動與依賴設定
└── README.md # 專案說明文件
```

---
