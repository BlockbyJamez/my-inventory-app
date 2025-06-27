<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <!-- 🟡 第一步：輸入帳號 -->
      <template v-if="step === 1">
        <h2>🔐 忘記密碼</h2>
        <p class="subtitle">請輸入帳號，我們將寄出驗證碼</p>
        <el-form :model="form">
          <el-form-item label="帳號">
            <el-input v-model="form.identifier" placeholder="請輸入帳號" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="sendCode" style="width: 100%;">
              寄出驗證碼
            </el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 🟠 第二步：輸入驗證碼 -->
      <template v-else-if="step === 2">
        <h2>📩 驗證信箱</h2>
        <p class="subtitle">請輸入收到的 6 碼驗證碼</p>
        <el-form :model="form">
          <el-form-item label="驗證碼">
            <el-input v-model="form.code" placeholder="請輸入驗證碼" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="verifyCode" style="width: 100%;">
              確認驗證碼
            </el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 🔴 第三步：輸入新密碼 -->
      <template v-else-if="step === 3">
        <h2>🔒 設定新密碼</h2>
        <p class="subtitle">請輸入新的密碼</p>
        <el-form :model="form">
          <el-form-item label="新密碼">
            <el-input v-model="form.newPassword" type="password" placeholder="請輸入新密碼" />
          </el-form-item>
            <el-form-item label="確認密碼">
            <el-input v-model="form.confirmPassword" type="password" placeholder="再次輸入密碼" />
            </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="resetPassword" style="width: 100%;">
              確認重設
            </el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const step = ref(1) // 1: 輸入帳號, 2: 驗證碼, 3: 新密碼

const form = reactive({
  identifier: '',
  code: '',
  newPassword: ''
})

async function sendCode() {
  if (!form.identifier) return ElMessage.warning('請輸入帳號')

  const res = await fetch('http://localhost:3000/api/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: form.identifier })
  })

  const result = await res.json()

  if (res.ok) {
    ElMessage.success('✅ 驗證碼已寄出')
    step.value = 2
  } else {
    ElMessage.error(result.error || '寄出失敗')
  }
}

async function verifyCode() {
  if (!form.code) return ElMessage.warning('請輸入驗證碼')

  const res = await fetch('http://localhost:3000/api/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: form.identifier, code: form.code })
  })

  const result = await res.json()
  if (res.ok) {
    ElMessage.success('✅ 驗證成功')
    step.value = 3
  } else {
    ElMessage.error(result.error || '驗證失敗')
  }
}

async function resetPassword() {
  if (!form.newPassword) return ElMessage.warning('請輸入新密碼')

    if (form.newPassword !== form.confirmPassword) {
    return ElMessage.error('兩次密碼不一致')
    }

  const res = await fetch('http://localhost:3000/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: form.code,
      newPassword: form.newPassword
    })
  })

  const result = await res.json()
  if (res.ok) {
    ElMessage.success('✅ 密碼已重設，請重新登入')
    router.push('/login')
  } else {
    ElMessage.error(result.error || '重設失敗')
  }
}
</script>

<style scoped>
.forgot-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fefcea, #f1da36);
}

.forgot-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: min(90vw, 400px);
  text-align: center;
}

.subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1.5rem;
}
</style>
