# 📦 我的庫存系統 (My Inventory System)

這是一個簡易的商品庫存管理系統，採用 **Vue 3 + Express + RESTful API** 架構開發，前後端分離，支援商品圖片上傳與庫存資料維護，適合作為前端 / 全端學習實戰或作品集展示。

---

## 🧰 使用技術

| 區塊 | 技術                                     |
| ---- | ---------------------------------------- |
| 前端 | Vue 3, Element Plus, Pinia, Axios        |
| 後端 | Node.js, Express                         |
| 工具 | concurrently, multer (圖片上傳), nodemon |

---

## 📸 功能介紹

- 商品列表與圖片顯示
- 商品新增 / 編輯 / 刪除
- 支援圖片上傳與預覽
- 依名稱模糊搜尋
- 分頁顯示 (5 筆/頁)
- 欄位排序功能（價格、分類、ID 等）
- 前後端同時啟動 (`npm run dev`)

---

## 📂 專案結構

my-inventory-app/
├── backend/ # Express API
├── frontend/ # Vue 3 SPA
├── node_modules/
├── package.json # 專案啟動設定
└── README.md

---
