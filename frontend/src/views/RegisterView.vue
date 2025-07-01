<template>
  <div class="register-container">
    <el-card class="register-card" shadow="always">
      <h2>📝 建立新帳號</h2>
      <p class="subtitle">請填寫下列欄位以註冊帳號</p>

      <el-form :model="form" ref="formRef" label-position="top" class="register-form">
        <el-form-item label="帳號">
          <el-input v-model="form.username" placeholder="請輸入帳號" />
        </el-form-item>

        <el-form-item label="密碼">
          <el-input v-model="form.password" type="password" placeholder="請輸入密碼" />
        </el-form-item>

        <el-form-item label="確認密碼">
          <el-input v-model="form.confirmPassword" type="password" placeholder="再次輸入密碼" />
        </el-form-item>

        <el-form-item label="電子信箱">
          <el-input v-model="form.email" placeholder="請輸入 Email" />
        </el-form-item>

        <el-button type="primary" @click="register" class="register-btn" size="large">
          註冊
        </el-button>

        <div class="login-link">
          <router-link to="/login">已有帳號？點此登入</router-link>
        </div>
      </el-form>
    </el-card>
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to right, #fefcea, #f1da36);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 450px;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
}

h2 {
  margin-bottom: 10px;
  font-size: 1.6rem;
  color: #303133;
}

.subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 24px;
}

.register-form {
  text-align: left;
}

.register-btn {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 16px;
}

.login-link {
  text-align: center;
  font-size: 0.85rem;
  color: #606266;
}
</style>
