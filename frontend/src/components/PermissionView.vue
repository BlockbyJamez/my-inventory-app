<template>
  <div class="permission-page">
    <el-card class="main-card" shadow="always">
      <div class="header">
        <el-page-header content="👑 權限管理" @back="goBack" />
      </div>

      <h2 class="title">🛂 使用者角色列表</h2>

      <!-- 加在 <h2 class="title"> 下方 -->
      <div class="filter-bar">
        <el-select v-model="roleFilter" placeholder="篩選角色" size="small" style="width: 160px">
          <el-option label="全部角色" value="" />
          <el-option label="admin" value="admin" />
          <el-option label="viewer" value="viewer" />
        </el-select>
      </div>

      <!-- 桌面版表格 -->
      <el-table v-if="!isMobile" :data="filteredUsers" border stripe style="width: 100%">
        <el-table-column prop="username" label="帳號" width="180" />
        <el-table-column prop="email" label="信箱" />
        <el-table-column prop="role" label="目前角色" width="180">
          <template #default="{ row }">
            <el-select
              v-model="row.role"
              placeholder="選擇角色"
              @change="role => updateRole(row.id, role)"
              size="small"
              style="width: 120px"
            >
              <el-option label="admin" value="admin" />
              <el-option label="viewer" value="viewer" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <!-- 📱 手機版卡片 -->
      <div v-else class="user-cards">
        <div v-for="row in filteredUsers" :key="row.id" class="user-card">
          <div class="row"><strong>帳號：</strong>{{ row.username }}</div>
          <div class="row"><strong>信箱：</strong>{{ row.email }}</div>
          <div class="row role-select">
            <strong>角色：</strong>
            <el-select
              v-model="row.role"
              placeholder="選擇角色"
              @change="role => updateRole(row.id, role)"
              size="small"
              style="width: 120px"
            >
              <el-option label="admin" value="admin" />
              <el-option label="viewer" value="viewer" />
            </el-select>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

const users = ref([])
const auth = useAuthStore()
const router = useRouter()
const roleFilter = ref("")

const filteredUsers = computed(() => {
  if (!roleFilter.value) return users.value
  return users.value.filter(user => user.role === roleFilter.value)
})

function goBack() {
  router.push('/')
}

async function fetchUsers() {
  const res = await fetch('http://localhost:3000/users', {
    headers: {
      'x-role': auth.user?.role || 'viewer',
      'x-username': auth.user?.username || ''
    }
  })
  const data = await res.json()
  if (res.ok) {
    users.value = data
  } else {
    ElMessage.error(data.error || '讀取失敗')
  }
}

async function updateRole(userId, newRole) {
  const res = await fetch(`http://localhost:3000/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-role': auth.user?.role || 'viewer',
      'x-username': auth.user?.username || ''
    },
    body: JSON.stringify({ role: newRole })
  })

  const result = await res.json()
  if (res.ok) {
    ElMessage.success('✅ 權限更新成功')
  } else {
    ElMessage.error('❌ ' + result.error)
    fetchUsers()
  }
}

const isMobile = ref(window.innerWidth <= 768)
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})

onMounted(fetchUsers)
</script>

<style scoped>
.permission-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  padding: 24px;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin: 20px 0;
  color: #303133;
}

/* 📱 手機版卡片樣式 */
.user-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.user-card {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background: #f9f9f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.user-card .row {
  margin-bottom: 8px;
}

.user-card .role-select {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
