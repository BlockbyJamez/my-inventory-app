<template>
  <div class="container product-list-page">
    <!-- ✅ Page Header -->
    <el-page-header content="商品庫存管理" @back="goBack" />

    <!-- ✅ 搜尋 + 新增 -->
    <div class="action-bar">
      <el-input
        v-model="searchText"
        placeholder="🔍 搜尋商品名稱"
        clearable
        class="search-input"
      />
      <el-button type="primary" @click="goToAdd">
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
      <el-table-column label="圖片" width="120">
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
      <el-table-column label="操作" width="200">
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

const router = useRouter();
const store = useProductStore();
const products = computed(() => store.products);

const searchText = ref("");
const currentPage = ref(1);
const pageSize = ref(5);

// ✅ 排序狀態：預設以 ID 升序
const defaultSort = ref({ prop: "id", order: "ascending" });
const currentSort = ref({ ...defaultSort.value });

// ✅ 排序 + 過濾後的資料
const sortedAndFiltered = computed(() => {
  let list = [...products.value];

  // 過濾
  if (searchText.value) {
    list = list.filter((p) =>
      p.name.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  // 排序
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

// ✅ 當前分頁
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedAndFiltered.value.slice(start, start + pageSize.value);
});

// ✅ 監聽排序事件
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
  ElMessageBox.confirm("確定要刪除這個商品嗎？", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      store.deleteProduct(id);
      ElMessage.success("已刪除！");
    })
    .catch(() => {
      ElMessage.info("已取消刪除");
    });
}

function openEdit(row) {
  editForm.value = { ...row };
  editDialogVisible.value = true;
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

.product-table {
  width: 100%;
  margin-bottom: 30px;
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
