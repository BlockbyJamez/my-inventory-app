// src/stores/authStore.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isViewer: (state) => state.user?.role === 'viewer',
  },
  actions: {
    login(userData) {
      this.user = userData
    },
    logout() {
      this.user = null
    },
  },
})
