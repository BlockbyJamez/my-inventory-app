// src/stores/productStore.js

import { defineStore } from 'pinia'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from './authStore'

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
      const auth = useAuthStore()
      await axios.post('http://localhost:3000/products', product, {
        headers: {
          'x-role': auth.user?.role
        }
      })
      this.fetchProducts()
      ElMessage.success('✅ 商品已新增')
    },

    async deleteProduct(id) {
      const auth = useAuthStore()
      await axios.delete(`http://localhost:3000/products/${id}`, {
        headers: {
          'x-role': auth.user?.role
        }
      })
      this.fetchProducts()
      ElMessage.success('🗑️ 商品已刪除')
    },

    async updateProduct(id, updatedData) {
      const auth = useAuthStore()
      await axios.put(`http://localhost:3000/products/${id}`, updatedData, {
        headers: {
          'x-role': auth.user?.role
        }
      })
      this.fetchProducts()
      ElMessage.success('✏️ 商品已更新')
    }
  }
})
