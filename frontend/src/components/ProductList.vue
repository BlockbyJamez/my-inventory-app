<template>

  <div class="container product-list-page">
    <!-- ✅ Page Header -->
    <el-page-header content="📊 商品庫存管理" @back="goBack" />

    <!-- ✅ 統計卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-title">📦 商品總數</div>
        <div class="stat-value">{{ stats.totalProducts }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">🧮 庫存總數</div>
        <div class="stat-value">{{ stats.totalStock }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">💰 庫存總價值</div>
        <div class="stat-value">{{ stats.totalValue.toLocaleString() }} 元</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">🏷️ 分類數量</div>
        <div class="stat-value">{{ Object.keys(stats.categoryCounts).length }}</div>
      </div>
    </div>

    <!-- ✅ 可折疊分類明細 -->
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

    <!-- ✅ 搜尋 + 新增 -->
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

    <!-- ✅ 商品表格（使用 default-sort） -->
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
          <el-button
            size="small"
            type="danger"
            @click="deleteProduct(scope.row.id)"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ✅ 分頁器 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="sortedAndFiltered.length"
      layout="prev, pager, next"
      class="pagination"
    />

    <!-- ✅ 編輯 Dialog -->
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
        <!-- ✅ 重新上傳圖片 -->
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
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProduct">儲存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/productStore";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')
const router = useRouter();
const store = useProductStore();
const products = computed(() => store.products);

const searchText = ref("");
const selectedCategory = ref("");
const currentPage = ref(1);
const pageSize = ref(5);

const defaultSort = ref({ prop: "id", order: "ascending" });
const currentSort = ref({ ...defaultSort.value });

// ✅ 分類選項
const categoryOptions = computed(() => {
  const categories = new Set(products.value.map((p) => p.category));
  return Array.from(categories);
});

// ✅ 篩選 + 排序
const sortedAndFiltered = computed(() => {
  let list = [...products.value];

  // 🔍 名稱過濾
  if (searchText.value) {
    list = list.filter((p) =>
      p.name.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  // 📂 分類過濾
  if (selectedCategory.value) {
    list = list.filter((p) => p.category === selectedCategory.value);
  }

  // ⬆⬇ 排序
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
    .then(() => {
      store.deleteProduct(id)
      ElMessage.success("已刪除！")
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
  await store.updateProduct(editForm.value.id, { ...editForm.value });
  ElMessage.success("✅ 已更新！");
  editDialogVisible.value = false;
}

function handleUploadSuccess(response) {
  editForm.value.image = response.imageUrl;
  ElMessage.success("✅ 圖片已更新！");
}
</script>

<style scoped>
/* ✅ 強化 page-header 樣式 */
.el-page-header {
  margin-bottom: 30px; /* 與統計卡片拉開距離 */
}

.el-page-header__content {
  font-size: 2rem;
  font-weight: 800;
  color: #1f1f1f;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 30px 0;
  flex-wrap: wrap;
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

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #f9fafc;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  text-align: center;
  border: 1px solid #e0e0e0;
}

.stat-title {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
}


.category-summary {
  margin: 20px 0 30px;
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
</style>
