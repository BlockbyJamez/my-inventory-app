# 📦 我的庫存系統 (My Inventory System)

這是一個簡易的商品庫存與帳號管理系統，採用 **Vue 3 + Express + RESTful API** 架構開發，前後端分離，支援圖片上傳、帳號登入驗證與庫存維護，適合作為前端 / 全端學習實戰或作品集展示。

---

## 🧰 使用技術

| 區塊 | 技術                                                 |
| ---- | ---------------------------------------------------- |
| 前端 | Vue 3, Element Plus, Pinia, Vue Router, Axios        |
| 後端 | Node.js, Express, SQLite3                            |
| 工具 | concurrently, multer (圖片上傳), nodemon, nodemailer |

---

## 📸 功能介紹

### ✅ 商品功能

- 商品列表與圖片顯示
- 商品新增 / 編輯 / 刪除
- 支援圖片上傳與預覽
- 依名稱模糊搜尋
- 分頁顯示 (5 筆/頁)
- 欄位排序（價格、分類、ID 等）

### ✅ 使用者功能

- 使用者註冊（需填寫帳號、密碼與 Email）
- 登入驗證（帳密比對）
- 忘記密碼：
  - 寄送 6 碼 Email 驗證碼
  - 驗證碼 1 分鐘內有效
  - 驗證成功後可重新設定密碼
- 角色系統（admin / viewer）：
  - admin 可新增/編輯/刪除商品
  - viewer 僅可檢視商品資料

### ✅ 系統整合

- RESTful API 設計
- 支援圖片上傳與靜態資源存取
- 支援前後端同時啟動 (`npm run dev`)

---

## 📂 專案結構

```
my-inventory-app/
├── backend/ # Node.js Express API
│ ├── index.js # 主後端伺服器
│ ├── init_db.js # 資料表初始化
│ ├── MYDB.db # SQLite 資料庫檔案
│ └── uploads/ # 上傳圖片存放處
├── frontend/ # Vue 3 SPA
│ └── src/views/ # 包含 Login / Register / ForgotPassword 等頁面
├── package.json # 專案啟動與依賴設定
└── README.md # 專案說明文件
```

---
