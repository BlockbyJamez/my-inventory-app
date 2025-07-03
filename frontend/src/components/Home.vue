<template>
  <div class="home-container">
    <div class="header">
      <h2>👋 歡迎，{{ authStore.user?.username }}</h2>
      <el-tag type="info" effect="dark">
        角色：{{ authStore.user?.role }}
      </el-tag>
    </div>

    <h1 class="title">📦 庫存管理系統首頁</h1>

    <div class="grid-menu">
      <el-card
        class="menu-card"
        shadow="hover"
        @click="$router.push('/products')"
      >
        <div class="card-icon">📋</div>
        <div class="card-text">商品庫存管理</div>
      </el-card>

      <el-card
        class="menu-card"
        shadow="hover"
        @click="$router.push('/transactions')"
      >
        <div class="card-icon">🔄</div>
        <div class="card-text">出入庫管理</div>
      </el-card>

      <el-card
        v-if="authStore.user?.role === 'admin'"
        class="menu-card"
        shadow="hover"
        @click="$router.push('/logs')"
      >
        <div class="card-icon">📝</div>
        <div class="card-text">操作紀錄</div>
      </el-card>

      <el-card
        v-if="authStore.user?.role === 'admin'"
        class="menu-card"
        shadow="hover"
        @click="$router.push('/permissions')"
      >
        <div class="card-icon">🔐</div>
        <div class="card-text">權限管理</div>
      </el-card>

      <el-card class="menu-card logout" shadow="hover" @click="handleLogout">
        <div class="card-icon">🚪</div>
        <div class="card-text">登出</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #f5f7fa, #e4edf4);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
  color: #303133;
}

.grid-menu {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.menu-card {
  text-align: center;
  cursor: pointer;
  padding: 30px 10px;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2.6rem;
  margin-bottom: 12px;
}

.card-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #303133;
}

.logout {
  background-color: #fff5f5;
  border: 1px solid #f56c6c;
  color: #f56c6c;
}

/* 📱 手機版 RWD */
body.is-mobile .home-container {
  padding: 1.2rem 1rem;
}

body.is-mobile .title {
  font-size: 1.6rem;
  margin-bottom: 24px;
}

body.is-mobile .grid-menu {
  grid-template-columns: 1fr;
  gap: 14px;
}

body.is-mobile .menu-card {
  padding: 20px 8px;
}

body.is-mobile .card-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

body.is-mobile .card-text {
  font-size: 1rem;
}
</style>
