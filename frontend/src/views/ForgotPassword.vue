<template>
  <div class="forgot-container">
    <el-card class="forgot-card" shadow="always">
      <template v-if="step === 1">
        <h2 class="title">🔐 忘記密碼</h2>
        <p class="subtitle">請輸入帳號，我們將寄出驗證碼</p>
        <el-form :model="form" label-position="top">
          <el-form-item label="帳號">
            <el-input
              v-model="form.identifier"
              placeholder="請輸入帳號"
              size="large"
              clearable
            />
          </el-form-item>
          <el-button
            type="primary"
            @click="sendCode"
            class="full-btn"
            size="large"
            round
          >
            寄出驗證碼
          </el-button>
        </el-form>
      </template>

      <template v-else-if="step === 2">
        <h2 class="title">📩 驗證信箱</h2>
        <p class="subtitle">請輸入收到的 6 碼驗證碼</p>
        <el-form :model="form" label-position="top">
          <el-form-item label="驗證碼">
            <el-input
              v-model="form.code"
              placeholder="請輸入驗證碼"
              size="large"
              clearable
            />
          </el-form-item>
          <el-button
            type="primary"
            @click="verifyCode"
            class="full-btn"
            size="large"
            round
          >
            確認驗證碼
          </el-button>
        </el-form>
      </template>

      <template v-else-if="step === 3">
        <h2 class="title">🔒 設定新密碼</h2>
        <p class="subtitle">請輸入新的密碼</p>
        <el-form :model="form" label-position="top">
          <el-form-item label="新密碼">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="請輸入新密碼"
              size="large"
              clearable
            />
          </el-form-item>
          <el-form-item label="確認密碼">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次輸入密碼"
              size="large"
              clearable
            />
          </el-form-item>
          <el-button
            type="primary"
            @click="resetPassword"
            class="full-btn"
            size="large"
            round
          >
            確認重設
          </el-button>
        </el-form>
      </template>
      <div class="login-link">
        已有帳號？
        <router-link to="/login">返回登入</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElLoading } from "element-plus";

const router = useRouter();
const step = ref(1);
const resetToken = ref("");
const form = reactive({
  identifier: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
});

async function sendCode() {
  if (!form.identifier) return ElMessage.warning("請輸入帳號");

  const loading = ElLoading.service({
    lock: true,
    text: "寄出驗證碼中...",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.6)",
  });

  try {
    const res = await fetch("http://localhost:3000/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: form.identifier }),
    });

    const result = await res.json();

    if (res.ok) {
      ElMessage.success("✅ 驗證碼已寄出");
      step.value = 2;
    } else {
      ElMessage.error(result.error || "寄出失敗");
    }
  } catch (err) {
    ElMessage.error("發生錯誤");
  } finally {
    loading.close();
  }
}

async function verifyCode() {
  if (!form.code) return ElMessage.warning("請輸入驗證碼");

  const loading = ElLoading.service({
    lock: true,
    text: "驗證中...",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.6)",
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const res = await fetch("http://localhost:3000/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.identifier, code: form.code }),
    });

    const result = await res.json();

    if (res.ok) {
      ElMessage.success("✅ 驗證成功");
      resetToken.value = result.token;
      step.value = 3;
    } else {
      ElMessage.error(result.error || "驗證失敗");
    }
  } catch (err) {
    ElMessage.error("發生錯誤");
  } finally {
    loading.close();
  }
}

async function resetPassword() {
  if (!form.newPassword || !form.confirmPassword) {
    return ElMessage.warning("請輸入新密碼");
  }

  if (form.newPassword !== form.confirmPassword) {
    return ElMessage.error("兩次密碼不一致");
  }

  const loading = ElLoading.service({
    lock: true,
    text: "重設密碼中...",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.6)",
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const res = await fetch("http://localhost:3000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: resetToken.value,
        newPassword: form.newPassword,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      ElMessage.success("✅ 密碼已重設，請重新登入");
      router.push("/login");
    } else {
      ElMessage.error(result.error || "重設失敗");
    }
  } catch (err) {
    ElMessage.error("發生錯誤");
  } finally {
    loading.close();
  }
}
</script>

<style scoped>
.forgot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #e4edf4);
  padding: 2rem;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  background-color: #ffffff;
}

.title {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  color: #303133;
}

.subtitle {
  font-size: 0.95rem;
  color: #909399;
  margin-bottom: 2rem;
}

.full-btn {
  width: 100%;
  margin-top: 1rem;
}

.login-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: #606266;
}

.login-link a {
  margin-left: 4px;
  color: #409eff;
  text-decoration: none;
}
</style>
