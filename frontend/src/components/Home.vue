<template>
  <div>
    <h1>📦 我的庫存系統</h1>
    <p>請選擇要進行的功能：</p>
    <div class="button-group">
      <el-button type="primary" @click="$router.push('/products')">
        商品庫存管理
      </el-button>
      <el-button type="success" @click="$router.push('/add')">
        新增商品
      </el-button>
      <el-button type="danger" @click="handleLogout">
        登出
      </el-button>
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
h1 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.el-button {
  width: 100%;
  padding: 12px 0;
  font-size: 1.1rem;
  transition: transform 0.1s ease;
}

.el-button:hover {
  transform: scale(1.02);
}
</style>
