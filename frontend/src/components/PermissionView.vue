<template>
  <div class="permission-page">
    <el-card>
      <div class="header">
        <el-page-header content="👑 權限管理" @back="goBack" />
      </div>

      <h2 class="title">🛂 使用者角色列表</h2>

      <el-table :data="users" border stripe style="width: 100%">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

const users = ref([])
const auth = useAuthStore()
const router = useRouter()

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

.title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin: 20px 0;
  color: #303133;
}
</style>
