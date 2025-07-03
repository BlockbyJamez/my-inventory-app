<template>
  <div class="product-list-page">
    <el-card class="main-card" shadow="always">
      <!-- ✅ Header + Title -->
      <div class="header">
        <el-page-header content="📊 商品庫存管理" @back="goBack" />
      </div>
      <h2 class="title">📋 商品列表與管理</h2>

      <!-- ✅ 統計卡片 -->
      <div class="stat-cards">
        <div class="stat-card" v-for="(item, key) in statDisplay" :key="key">
          <div class="stat-title">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </div>
      </div>

      <!-- ✅ 分類統計 -->
      <details class="category-summary">
        <summary>🏷️ 分類統計（共 {{ Object.keys(stats.categoryCounts).length }} 類）</summary>
        <div class="category-list">
          <span
            v-for="(count, category) in stats.categoryCounts"
            :key="category"
            class="category-chip"
          >
            {{ category }} ({{ count }})
          </span>
        </div>
      </details>

      <!-- ✅ 搜尋列 -->
      <div class="action-bar">
        <el-input
          v-model="searchText"
          placeholder="🔍 搜尋商品名稱"
          clearable
          class="search-input"
        />
        <el-select
          v-model="selectedCategory"
          placeholder="📂 篩選分類"
          clearable
          class="category-select"
        >
          <el-option
            v-for="category in categoryOptions"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
        <el-button v-if="isAdmin" type="primary" @click="goToAdd">
          ➕ 新增商品
        </el-button>
      </div>

      <!-- ✅ 桌面版表格 / 手機版卡片切換 -->
      <div v-if="!isMobile">
        <el-table
          :data="paginatedData"
          class="product-table"
          :default-sort="{ prop: defaultSort.prop, order: defaultSort.order }"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="id" label="ID" width="80" sortable />
          <el-table-column label="圖片" width="120" align="center" header-align="center">
            <template #default="scope">
              <img
                :src="scope.row.image || 'https://via.placeholder.com/100'"
                alt="無圖"
                class="thumbnail"
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名稱" sortable />
          <el-table-column prop="category" label="分類" sortable />
          <el-table-column prop="price" label="價格" sortable />
          <el-table-column prop="stock" label="庫存數量" sortable />
          <el-table-column label="操作" width="200" v-if="isAdmin">
            <template #default="scope">
              <el-button size="small" @click="openEdit(scope.row)">編輯</el-button>
              <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ✅ 手機版卡片 -->
      <div v-else class="product-card-list">
        <div v-for="item in paginatedData" :key="item.id" class="product-card">
          <img :src="item.image || 'https://via.placeholder.com/100'" alt="商品圖" />
          <div class="product-info">
            <p><strong>商品名稱：</strong>{{ item.name }}</p>
            <p><strong>分類：</strong>{{ item.category }}</p>
            <p><strong>價格：</strong>{{ item.price }}</p>
            <p><strong>庫存：</strong>{{ item.stock }}</p>
          </div>
          <div v-if="isAdmin" class="card-actions">
            <el-button size="small" @click="openEdit(item)">編輯</el-button>
            <el-button size="small" type="danger" @click="deleteProduct(item.id)">刪除</el-button>
          </div>
        </div>
      </div>

      <!-- ✅ 分頁器 -->
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="sortedAndFiltered.length"
        layout="prev, pager, next"
        class="pagination"
      />
    </el-card>

    <!-- ✅ 編輯 Dialog 保持不包在 card 內 -->
    <el-dialog v-model="editDialogVisible" title="編輯商品" width="500px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="商品名稱">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="分類">
          <el-input v-model="editForm.category" />
        </el-form-item>
        <el-form-item label="價格">
          <el-input-number v-model="editForm.price" :min="0" />
        </el-form-item>
        <el-form-item label="庫存數量">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editForm.description" />
        </el-form-item>
        <el-form-item label="重新上傳圖片">
          <el-upload
            action="http://localhost:3000/upload"
            name="image"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
          >
            <el-button>選擇圖片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="目前圖片">
          <img
            v-if="editForm.image"
            :src="editForm.image"
            alt="預覽"
            class="thumbnail"
          />
        </el-form-item>
      </el-form>

      <template #footer>
      <div class="dialog-footer-buttons">
        <el-button size="small" @click="editDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="updateProduct">儲存</el-button>
      </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { useProductStore } from "@/stores/productStore"
import { ElMessageBox, ElMessage } from "element-plus"
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')
const router = useRouter()
const store = useProductStore()
const products = computed(() => store.products);

const searchText = ref("")
const selectedCategory = ref("")
const currentPage = ref(1)
const pageSize = ref(5)

const defaultSort = ref({ prop: "id", order: "ascending" })
const currentSort = ref({ ...defaultSort.value })

const isMobile = ref(window.innerWidth <= 768)
function handleResize() {
  isMobile.value = window.innerWidth <= 768
}
window.addEventListener("resize", handleResize)
onUnmounted(() => window.removeEventListener("resize", handleResize))

const categoryOptions = computed(() => {
  const categories = new Set(products.value.map((p) => p.category));
  return Array.from(categories);
});

const sortedAndFiltered = computed(() => {
  let list = [...products.value];

  if (searchText.value) {
    list = list.filter((p) =>
      p.name.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  if (selectedCategory.value) {
    list = list.filter((p) => p.category === selectedCategory.value);
  }

  if (currentSort.value.prop && currentSort.value.order !== null) {
    const prop = currentSort.value.prop;
    const order = currentSort.value.order === "ascending" ? 1 : -1;
    list.sort((a, b) => {
      if (a[prop] < b[prop]) return -1 * order;
      if (a[prop] > b[prop]) return 1 * order;
      return 0;
    });
  }

  return list;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedAndFiltered.value.slice(start, start + pageSize.value);
});

function handleSortChange({ prop, order }) {
  currentSort.value = { prop, order };
}

const editDialogVisible = ref(false);
const editForm = ref({
  id: null,
  name: "",
  stock: 0,
  price: 0,
  category: "",
  description: "",
  image: ""
});

onMounted(() => {
  store.fetchProducts();
});

const stats = computed(() => {
  const list = sortedAndFiltered.value;
  const totalProducts = list.length;
  const totalStock = list.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = list.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

  const categoryCounts = {};
  list.forEach((p) => {
    const cat = p.category || "未分類";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return {
    totalProducts,
    totalStock,
    totalValue,
    categoryCounts,
  };
});

const statDisplay = computed(() => ({
  totalProducts: {
    label: '📦 商品總數',
    value: stats.value.totalProducts
  },
  totalStock: {
    label: '🧮 庫存總數',
    value: stats.value.totalStock
  },
  totalValue: {
    label: '💰 庫存總價值',
    value: stats.value.totalValue.toLocaleString() + ' 元'
  },
  categoryCount: {
    label: '🏷️ 分類數量',
    value: Object.keys(stats.value.categoryCounts).length
  }
}))

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

function goToAdd() {
  router.push("/add");
}

function deleteProduct(id) {
  if (!isAdmin.value) return
  ElMessageBox.confirm("確定要刪除這個商品嗎？", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await store.deleteProduct(id)
        ElMessage.success("✅ 已刪除！")
      } catch (err) {
        ElMessage.error("❌ 刪除失敗：" + (err.response?.data?.error || err.message))
      }
    })
    .catch(() => {
      ElMessage.info("已取消刪除")
    })
}

function openEdit(row) {
  if (!isAdmin.value) return
  editForm.value = { ...row }
  editDialogVisible.value = true
}

async function updateProduct() {
  try {
    await store.updateProduct(editForm.value.id, { ...editForm.value })
    ElMessage.success("✅ 已更新！")
    editDialogVisible.value = false
  } catch (err) {
    ElMessage.error("❌ 更新失敗：" + (err.response?.data?.error || err.message))
  }
}

function handleUploadSuccess(response) {
  editForm.value.image = response.imageUrl;
  ElMessage.success("✅ 圖片已更新！");
}
</script>

<style scoped>
.product-list-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  background-color: #fff;
  border: 1px solid #ebeef5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin: 20px 0 30px;
  color: #303133;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 1px solid #ebeef5;
}

.stat-title {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #303133;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.search-input {
  flex: 1 1 250px;
  max-width: 300px;
}

.category-select {
  flex: 1 1 200px;
  max-width: 220px;
}

.product-table {
  width: 100%;
  margin-bottom: 30px;
}

.product-card-list {
  display: none;
}

.category-summary {
  margin-bottom: 30px;
  font-size: 1rem;
  color: #444;
}

.category-summary summary {
  cursor: pointer;
  font-weight: 600;
  padding: 8px 0;
  list-style: none;
}

.category-summary summary::-webkit-details-marker {
  display: none;
}

.category-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-left: 1.5rem;
}

.category-chip {
  background-color: #fff3e0;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid #ffc107;
  font-weight: 500;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 5px;
  display: block;
  margin: 0 auto;
}

.pagination {
  text-align: center;
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-title {
    font-size: 0.9rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .category-list {
    padding-left: 0;
    justify-content: flex-start;
    font-size: 14px;
  }

  .category-chip {
    padding: 4px 10px;
    font-size: 13px;
  }

  .action-bar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px !important;
    margin-bottom: 10px !important;
  }

  .search-input,
  .category-select,
  .el-button {
    width: 100%;
    max-width: 100%;
  }

  .search-input .el-input__wrapper,
  .category-select .el-input__wrapper {
    min-height: 36px !important;
    padding: 4px 10px !important;
    font-size: 14px;
    box-sizing: border-box;
  }

  .search-input .el-input,
  .category-select .el-input {
    line-height: 1.2 !important;
  }

  .el-input__inner {
    font-size: 14px;
  }

  .el-button {
    height: 36px;
    font-size: 14px;
    margin-top: 0 !important;
  }

  .el-form-item {
    margin-bottom: 10px !important;
  }

  .product-card-list {
    display: flex !important;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
  }

  .product-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 16px;
    text-align: left;
  }

  .product-card img {
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0 auto 12px;
    border-radius: 12px;
    background-color: #f9f9f9;
    object-fit: contain;
  }

  .product-info {
    font-size: 14px;
    color: #333;
  }

  .product-info p {
    margin: 4px 0;
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .card-actions .el-button {
    flex: 1;
    min-width: 0;
  }

  .pagination {
    text-align: center;
    margin-top: 20px;
  }

  .dialog-footer-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .dialog-footer-buttons .el-button {
    flex: 1 1 40%;
    min-width: 100px;
    white-space: nowrap;
  }
}
</style>
