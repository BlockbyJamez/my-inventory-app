<template>
  <div class="product-list">
    <!-- ✅ Page Header -->
    <el-page-header content="商品庫存管理" @back="goBack" />

    <!-- ✅ 搜尋輸入框 -->
    <el-input
      v-model="searchText"
      placeholder="🔍 搜尋商品名稱"
      clearable
      style="margin: 20px 0; max-width: 300px;"
    />

    <!-- ✅ 新增按鈕 -->
    <el-button type="primary" @click="goToAdd">
      ➕ 新增商品
    </el-button>

    <!-- ✅ 商品表格 -->
    <el-table
      :data="paginatedData"
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="id" label="ID" width="80" sortable />
      <el-table-column prop="name" label="商品名稱" sortable />
      <el-table-column prop="stock" label="庫存數量" sortable />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">編輯</el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ✅ 分頁器 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredProducts.length"
      layout="prev, pager, next"
      style="margin-top: 20px; text-align: center;"
    />

    <!-- ✅ 編輯 Dialog -->
    <el-dialog v-model="editDialogVisible" title="編輯商品">
      <el-form :model="editForm">
        <el-form-item label="商品名稱">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="庫存數量">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProduct">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const store = useProductStore()
const products = computed(() => store.products)

// ✅ 搜尋文字
const searchText = ref('')

// ✅ 分頁設定
const currentPage = ref(1)
const pageSize = ref(5)  // 每頁幾筆

// ✅ 搜尋後結果
const filteredProducts = computed(() => {
  if (!searchText.value) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// ✅ 分頁後結果
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

// ✅ 編輯 Dialog
const editDialogVisible = ref(false)
const editForm = ref({ id: null, name: '', stock: 0 })

onMounted(() => {
  store.fetchProducts()
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function goToAdd() {
  router.push('/add')
}

function deleteProduct(id) {
  ElMessageBox.confirm('確定要刪除這個商品嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      store.deleteProduct(id)
      ElMessage.success('已刪除！')
    })
    .catch(() => {
      ElMessage.info('已取消刪除')
    })
}

function openEdit(row) {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

async function updateProduct() {
  await store.updateProduct(editForm.value.id, {
    name: editForm.value.name,
    stock: editForm.value.stock,
  })
  editDialogVisible.value = false
}
</script>

<style scoped>
.product-list {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}
</style>
