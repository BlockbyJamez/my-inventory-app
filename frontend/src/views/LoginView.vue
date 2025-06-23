<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <h1>🔐 登入系統</h1>
    <el-form :model="form" style="max-width: 300px;">
      <el-form-item label="帳號">
        <el-input v-model="form.username" placeholder="請輸入帳號" />
      </el-form-item>
      <el-form-item label="密碼">
        <el-input v-model="form.password" type="password" placeholder="請輸入密碼" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登入</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

function login() {
  // Demo: 簡易驗證，帳號 admin / 密碼 1234
  if (form.username === 'admin' && form.password === '1234') {
    auth.login(form.username)
    ElMessage.success('✅ 登入成功！')
    router.push('/')
  } else {
    ElMessage.error('❌ 帳號或密碼錯誤！')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
</style>
