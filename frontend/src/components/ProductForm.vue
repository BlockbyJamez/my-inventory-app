<template>
  <div class="product-form-page">
    <el-card class="main-card" shadow="always">
      <!-- 📦 標題列 -->
      <div class="header">
        <el-page-header content="📦 新增商品" @back="goBack" />
      </div>

      <h2 class="title">📝 請輸入商品資訊</h2>

      <!-- 桌面版表單 -->
      <el-form v-if="!isMobile" :model="form" label-width="120px" class="product-form">
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
          <el-input type="textarea" v-model="form.description" placeholder="請輸入描述" />
        </el-form-item>
        <el-form-item label="上傳圖片">
          <el-upload action="http://localhost:3000/upload" name="image" :show-file-list="false" :on-success="handleUploadSuccess">
            <el-button>選擇圖片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="預覽圖片">
          <img v-if="form.image" :src="form.image" alt="預覽" class="thumbnail" />
        </el-form-item>
      </el-form>

      <!-- 手機版表單 -->
      <div v-else class="mobile-form">
        <label>商品名稱</label>
        <el-input v-model="form.name" placeholder="請輸入商品名稱" />

        <label>分類</label>
        <el-input v-model="form.category" placeholder="請輸入分類" />

        <label>價格</label>
        <el-input-number v-model="form.price" :min="0" :step="100" />

        <label>庫存數量</label>
        <el-input-number v-model="form.stock" :min="1" />

        <label>描述</label>
        <el-input type="textarea" v-model="form.description" placeholder="請輸入描述" />

        <label>上傳圖片</label>
        <el-upload action="http://localhost:3000/upload" name="image" :show-file-list="false" :on-success="handleUploadSuccess">
          <el-button>選擇圖片</el-button>
        </el-upload>

        <label>預覽圖片</label>
        <img v-if="form.image" :src="form.image" alt="預覽" class="thumbnail" />
      </div>

      <!-- 通用按鈕區 -->
      <div class="action-bar">
        <div class="button-wrap">
          <el-button type="primary" @click="addProduct">➕ 新增</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useProductStore()
const isMobile = ref(false)

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
    Object.assign(form, {
      name: '',
      category: '',
      price: 0,
      stock: 1,
      description: '',
      image: ''
    })
    router.push('/products')
  } catch (err) {
    ElMessage.error('❌ 新增失敗：' + (err.message || '伺服器錯誤'))
  }
}

function goBack() {
  router.back()
}

function handleResize() {
  isMobile.value = window.innerWidth <= 600
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
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

.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 5px;
  display: block;
  margin: auto;
}

.mobile-form label {
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 4px;
  display: block;
  color: #333;
}

.mobile-form .el-input,
.mobile-form .el-input-number,
.mobile-form .el-textarea {
  width: 100%;
}

.mobile-form .el-upload {
  width: 100%;
  margin-top: 4px;
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.button-wrap {
  display: flex;
  width: 100%;
  gap: 10px;
}

.button-wrap .el-button {
  flex: 1;
}
</style>
