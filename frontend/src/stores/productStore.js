// src/stores/productStore.js

import { defineStore } from 'pinia'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: []
  }),
  actions: {
    async fetchProducts() {
      const res = await axios.get('http://localhost:3000/products')
      this.products = res.data
    },
    async addProduct(product) {
      await axios.post('http://localhost:3000/products', product)
      this.fetchProducts()
      ElMessage.success('✅ 商品已新增')
    },
    async deleteProduct(id) {
      await axios.delete(`http://localhost:3000/products/${id}`)
      this.fetchProducts()
      ElMessage.success('🗑️ 商品已刪除')
    },
    async updateProduct(id, updatedData) {
      await axios.put(`http://localhost:3000/products/${id}`, updatedData)
      this.fetchProducts()
      ElMessage.success('✏️ 商品已更新')
    }
  }
})
