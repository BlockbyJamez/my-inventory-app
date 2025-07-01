<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <h2>🔐 登入系統</h2>
      <p class="subtitle">歡迎回來，請輸入帳號與密碼</p>

      <el-form :model="form" class="login-form" label-position="top">
        <el-form-item label="帳號">
          <el-input v-model="form.username" placeholder="請輸入帳號" />
        </el-form-item>

        <el-form-item label="密碼">
          <el-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="請輸入密碼"
            :suffix-icon="showPassword ? 'el-icon-view' : 'el-icon-view-off'"
            @click-suffix="togglePassword"
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="form.remember">記住我</el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">忘記密碼？</router-link>
        </div>

        <el-button type="primary" @click="login" class="login-btn" size="large">
          登入
        </el-button>

        <div class="register-link">
          <router-link to="/register">尚未註冊帳號？</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)
const togglePassword = () => (showPassword.value = !showPassword.value)

const form = reactive({
  username: '',
  password: '',
  remember: false
})

onMounted(() => {
  const saved = localStorage.getItem('savedUsername')
  if (saved) form.username = saved
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

    if (form.remember) {
      localStorage.setItem('savedUsername', form.username)
    } else {
      localStorage.removeItem('savedUsername')
    }

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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #eef1f6, #d3dce6);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
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

.login-form {
  text-align: left;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0 20px;
}

.forgot-link {
  font-size: 0.8rem;
  color: #409eff;
  text-decoration: none;
}

.login-btn {
  width: 100%;
  margin-bottom: 16px;
}

.register-link {
  text-align: center;
  font-size: 0.85rem;
  color: #606266;
}
</style>
