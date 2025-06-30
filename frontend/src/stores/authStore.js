// src/stores/authStore.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,         // e.g. { username: 'danny', role: 'admin' }
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isViewer: (state) => state.user?.role === 'viewer',
  },
  actions: {
    login(userData) {
      this.user = userData // { username, role }
    },
    logout() {
      this.user = null
    },
  },
})
