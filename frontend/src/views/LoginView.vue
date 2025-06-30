<template>
  <div class="login-page">
    <div class="login-card">
      <h2>🔐 登入系統</h2>
      <p class="subtitle">歡迎回來，請輸入您的帳號密碼</p>
      <el-form :model="form" class="login-form">
        <el-form-item label="帳號">
          <el-input v-model="form.username" placeholder="請輸入帳號" />
        </el-form-item>
        <el-form-item label="密碼">
          <el-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="請輸入密碼"
            suffix-icon="el-icon-view"
            @click-suffix="togglePassword"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.remember">記住我</el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">忘記密碼？</router-link>
        </el-form-item>
        <el-form-item style="text-align: center;">
          <router-link to="/register">沒有帳號？立即註冊</router-link>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" style="width: 100%;">
            登入
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'
import { onMounted } from 'vue'

onMounted(() => {
  const saved = localStorage.getItem('savedUsername')
  if (saved) form.username = saved
})

const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)
function togglePassword() {
  showPassword.value = !showPassword.value
}

const form = reactive({
  username: '',
  password: '',
  remember: false
})

async function login() {
  if (!form.username || !form.password) {
    ElMessage.warning('請輸入帳號與密碼')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        password: form.password
      })
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || '登入失敗')
    }

    const result = await res.json()

    // ✅ 記住帳號
    if (form.remember) {
      localStorage.setItem('savedUsername', form.username)
    } else {
      localStorage.removeItem('savedUsername')
    }

    // ✅ 正確傳入 username + role
    auth.login({
      username: result.username,
      role: result.role
    })

    ElMessage.success('✅ 登入成功！')
    router.push('/')
  } catch (err) {
    ElMessage.error('❌ ' + err.message)
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: min(90vw, 400px);
  text-align: center;
}

h2 {
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.forgot-link {
  float: right;
  font-size: 0.8rem;
  color: #409eff;
  text-decoration: none;
}
</style>
