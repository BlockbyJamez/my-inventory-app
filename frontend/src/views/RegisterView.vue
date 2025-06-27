<template>
  <div class="register-page">
    <div class="register-card">
      <h2>📝 建立新帳號</h2>
      <el-form :model="form" ref="formRef" class="register-form">
        <el-form-item label="帳號">
          <el-input v-model="form.username" placeholder="請輸入帳號" />
        </el-form-item>
        <el-form-item label="密碼">
          <el-input v-model="form.password" type="password" placeholder="請輸入密碼" />
        </el-form-item>
        <el-form-item label="確認密碼">
          <el-input v-model="form.confirmPassword" type="password" placeholder="再次輸入密碼" />
        </el-form-item>
        <el-form-item label="信箱">
          <el-input v-model="form.email" placeholder="請輸入 Email" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="register" style="width: 100%;">註冊</el-button>
        </el-form-item>
        <el-form-item style="text-align: center;">
          <router-link to="/login">已有帳號？前往登入</router-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

async function register() {
  if (!form.username || !form.password || !form.confirmPassword || !form.email) {
    ElMessage.warning('請填寫所有欄位')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.error('密碼與確認密碼不一致')
    return
  }
  // 簡單 email 格式驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.error('請輸入有效的 Email 格式')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        email: form.email
      })
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || '註冊失敗')
    }

    ElMessage.success('✅ 註冊成功，請登入')
    router.push('/login')
  } catch (err) {
    ElMessage.error('❌ ' + err.message)
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to right, #fceabb, #f8b500);
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: min(90vw, 400px);
  text-align: center;
}
</style>
