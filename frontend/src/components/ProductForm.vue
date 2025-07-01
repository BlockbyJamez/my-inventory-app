<template>
  <div class="product-form-page">
    <el-card>
      <!-- 📦 標題列 -->
      <div class="header">
        <el-page-header content="📦 新增商品" @back="goBack" />
      </div>

      <h2 class="title">📝 請輸入商品資訊</h2>

      <!-- 🧾 表單 -->
      <el-form :model="form" label-width="120px" class="product-form">
        <el-form-item label="商品名稱">
          <el-input v-model="form.name" placeholder="請輸入商品名稱" />
        </el-form-item>

        <el-form-item label="分類">
          <el-input v-model="form.category" placeholder="請輸入分類" />
        </el-form-item>

        <el-form-item label="價格">
          <el-input-number v-model="form.price" :min="0" :step="100" />
        </el-form-item>

        <el-form-item label="庫存數量">
          <el-input-number v-model="form.stock" :min="1" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="請輸入描述"
          />
        </el-form-item>

        <el-form-item label="上傳圖片">
          <el-upload
            action="http://localhost:3000/upload"
            name="image"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
          >
            <el-button>選擇圖片</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="預覽圖片">
          <img
            v-if="form.image"
            :src="form.image"
            alt="預覽"
            class="thumbnail"
          />
        </el-form-item>

        <el-form-item class="action-bar">
          <el-button type="primary" @click="addProduct">➕ 新增</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useProductStore()

const form = reactive({
  name: '',
  stock: 1,
  price: 0,
  category: '',
  description: '',
  image: ''
})

function handleUploadSuccess(response) {
  form.image = response.imageUrl
  ElMessage.success('✅ 圖片已上傳並套用！')
}

async function addProduct() {
  if (!form.name.trim()) {
    ElMessage.warning('請輸入商品名稱')
    return
  }
  if (form.stock <= 0) {
    ElMessage.warning('庫存數量需大於 0')
    return
  }
  if (form.price < 0) {
    ElMessage.warning('價格不能小於 0')
    return
  }

  try {
    await store.addProduct({ ...form })
    ElMessage.success('✅ 商品已新增！')

    // 重置表單
    form.name = ''
    form.category = ''
    form.price = 0
    form.stock = 1
    form.description = ''
    form.image = ''

    router.push('/products')
  } catch (err) {
    ElMessage.error('❌ 新增失敗：' + (err.message || '伺服器錯誤'))
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.product-form-page {
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

.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 5px;
  display: block;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}
</style>
