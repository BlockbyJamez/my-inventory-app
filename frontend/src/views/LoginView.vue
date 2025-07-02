<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <h2 class="title">🔐 登入系統</h2>
      <p class="subtitle">歡迎回來，請輸入帳號與密碼</p>

      <el-form :model="form" class="login-form" label-position="top">
        <el-form-item label="帳號">
          <el-input
            v-model="form.username"
            placeholder="請輸入帳號"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="密碼">
          <el-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="請輸入密碼"
            :suffix-icon="showPassword ? 'View' : 'ViewOff'"
            @click-suffix="togglePassword"
            size="large"
            clearable
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="form.remember" size="small">記住我</el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">
            忘記密碼？
          </router-link>
        </div>

        <el-button
          type="primary"
          @click="login"
          class="login-btn"
          size="large"
          round
        >
          登入
        </el-button>

        <div class="register-link">
          尚未註冊帳號？
          <router-link to="/register">立即註冊</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { ElMessage, ElLoading } from "element-plus";

const router = useRouter();
const auth = useAuthStore();

const showPassword = ref(false);
const togglePassword = () => (showPassword.value = !showPassword.value);

const form = reactive({
  username: "",
  password: "",
  remember: false,
});

onMounted(() => {
  const saved = localStorage.getItem("savedUsername");
  if (saved) form.username = saved;
});

async function login() {
  if (!form.username || !form.password) {
    ElMessage.warning("請輸入帳號與密碼");
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    text: "登入中...",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.7)",
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "登入失敗");
    }

    const result = await res.json();

    if (form.remember) {
      localStorage.setItem("savedUsername", form.username);
    } else {
      localStorage.removeItem("savedUsername");
    }

    auth.login({
      username: result.username,
      role: result.role,
    });

    ElMessage.success("✅ 登入成功！");
    router.push("/");
  } catch (err) {
    ElMessage.error("❌ " + err.message);
  } finally {
    loading.close();
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #e4edf4);
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  font-size: 0.95rem;
  color: #909399;
  margin-bottom: 2rem;
  text-align: center;
}

.login-form {
  text-align: left;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0 1.5rem;
}

.forgot-link {
  font-size: 0.85rem;
  color: #409eff;
  text-decoration: none;
}

.login-btn {
  width: 100%;
  margin-bottom: 1rem;
}

.register-link {
  text-align: center;
  font-size: 0.85rem;
  color: #606266;
}

.register-link a {
  margin-left: 4px;
  color: #409eff;
  text-decoration: none;
}
</style>
