<template>
  <div class="product-form">
    <el-page-header content="新增商品" @back="goBack" />

    <el-form :model="form" label-width="80px" style="margin-top: 20px;">
      <el-form-item label="商品名稱">
        <el-input v-model="form.name" placeholder="請輸入商品名稱" />
      </el-form-item>

      <el-form-item label="庫存數量">
        <el-input-number v-model="form.stock" :min="1" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="addProduct">新增</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
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
  stock: 1
})

function addProduct() {
  if (!form.name.trim()) {
    ElMessage.warning('請輸入商品名稱')
    return
  }
  if (form.stock <= 0) {
    ElMessage.warning('庫存數量需大於 0')
    return
  }

  store.addProduct({ name: form.name, stock: form.stock })
  ElMessage.success('✅ 已新增！')

  // 清空表單
  form.name = ''
  form.stock = 1

  // ✅ 自動返回列表
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.product-form {
  max-width: 500px;
  margin: 40px auto;
  padding: 0 20px;
}
</style>
