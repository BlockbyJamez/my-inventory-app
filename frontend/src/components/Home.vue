<!-- src/components/Home.vue -->
<template>
  <div class="container home-page">
    <h1>📦 我的庫存系統</h1>
    <p>請選擇要進行的功能：</p>
    <div class="button-group">
      <button class="custom-btn primary" @click="$router.push('/products')">
        商品庫存管理
      </button>
      <button class="custom-btn success" @click="$router.push('/add')">
        新增商品
      </button>
      <button class="custom-btn danger" @click="handleLogout">
        登出
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-page {
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
}

.custom-btn {
  width: 100%;
  padding: 14px 0;
  font-size: 1.1rem;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.1s ease;
}

.custom-btn.primary {
  background-color: #409eff;
}

.custom-btn.success {
  background-color: #67c23a;
}

.custom-btn.danger {
  background-color: #f56c6c;
}

.custom-btn:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}
</style>
