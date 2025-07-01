<template>
  <div class="transaction-page">
    <el-card>
      <div class="header">
        <el-page-header content="📦 出入庫管理" @back="goBack" />
      </div>

      <h2 class="title">📝 新增出入庫紀錄</h2>
      <el-form :model="form" label-width="80px" @submit.prevent>
        <el-form-item label="商品">
          <el-select v-model="form.product_id" placeholder="請選擇商品" style="width: 100%">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="類型">
          <el-radio-group v-model="form.type">
            <el-radio value="in">入庫</el-radio>
            <el-radio value="out">出庫</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="數量">
          <el-input-number v-model="form.quantity" :min="1" />
        </el-form-item>

        <el-form-item label="備註">
          <el-input v-model="form.note" placeholder="可留空" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" style="width: 100%">送出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2 class="title">🔍 篩選條件</h2>
      <el-form :inline="true" :model="filter" class="filter-form" label-width="60px">
        <el-form-item label="商品">
          <el-select v-model="filter.product_id" placeholder="全部商品" style="width: 180px">
            <el-option label="全部商品" :value="''" />
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="類型">
          <el-select v-model="filter.type" placeholder="全部" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="入庫" value="in" />
            <el-option label="出庫" value="out" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter">清除篩選</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <h2 class="title">📑 最近交易紀錄</h2>
      <el-table :data="filteredTransactions" border stripe style="width: 100%">
        <el-table-column prop="timestamp" label="時間" width="180" />
        <el-table-column prop="product_name" label="商品" />
        <el-table-column prop="type" label="類型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'in' ? 'success' : 'danger'">
              {{ row.type === 'in' ? '入庫' : '出庫' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="數量" width="80" />
        <el-table-column prop="note" label="備註" />
        <el-table-column prop="operator" label="操作人" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const products = ref([])
const transactions = ref([])
const form = ref({
  product_id: null,
  type: 'in',
  quantity: 1,
  note: ''
})

const filter = ref({
  product_id: '',
  type: ''
})

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    return (!filter.value.type || t.type === filter.value.type) &&
           (!filter.value.product_id || t.product_id === filter.value.product_id)
  })
})

function resetFilter() {
  filter.value.product_id = ''
  filter.value.type = ''
}

async function fetchProducts() {
  const res = await fetch('http://localhost:3000/products')
  products.value = await res.json()
  if (products.value.length) form.value.product_id = products.value[0].id
}

async function fetchTransactions() {
  const res = await fetch('http://localhost:3000/transactions')
  transactions.value = await res.json()
}

async function handleSubmit() {
  const auth = useAuthStore()
  const role = auth.user?.role || 'viewer'
  const username = auth.user?.username || 'unknown'
  const res = await fetch('http://localhost:3000/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-role': role,
      'x-username': username
    },
    body: JSON.stringify(form.value)
  })

  const result = await res.json()
  if (res.ok) {
    ElMessage.success('✅ 出入庫成功')
    form.value.quantity = 1
    form.value.note = ''
    fetchTransactions()
  } else {
    ElMessage.error('❌ ' + result.error)
  }
}

onMounted(() => {
  fetchProducts()
  fetchTransactions()
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.transaction-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
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
