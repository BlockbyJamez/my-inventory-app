<template>
  <div class="transaction-page">
    <!-- 新增出入庫 -->
    <el-card class="main-card" shadow="always">
      <div class="header">
        <el-page-header content="📦 出入庫管理" @back="goBack" />
      </div>

      <h2 class="title">📝 新增出入庫紀錄</h2>
      <el-form :model="form" label-position="top" @submit.prevent>
        <el-form-item label="商品">
          <el-select
            v-model="form.product_id"
            placeholder="請選擇商品"
            class="full-width"
          >
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="類型">
          <el-radio-group v-model="form.type">
            <el-radio value="in">入庫</el-radio>
            <el-radio value="out">出庫</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="數量">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            class="full-width"
          />
        </el-form-item>

        <el-form-item label="備註">
          <el-input
            v-model="form.note"
            placeholder="可留空"
            class="full-width"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            size="large"
            round
            class="full-width"
          >
            送出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 篩選條件 -->
    <el-card class="main-card" shadow="always">
      <h2 class="title">🔍 篩選條件</h2>
      <el-form :inline="false" label-position="top" :model="filter" class="filter-form">
        <el-form-item label="商品">
          <el-select
            v-model="filter.product_id"
            placeholder="全部商品"
            class="full-width"
          >
            <el-option label="全部商品" :value="''" />
            <el-option
              v-for="p in products"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="類型">
          <el-select v-model="filter.type" placeholder="全部" class="full-width">
            <el-option label="全部" value="" />
            <el-option label="入庫" value="in" />
            <el-option label="出庫" value="out" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="full-width" @click="resetFilter">
            清除篩選
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 交易紀錄 -->
    <el-card class="main-card" shadow="always">
      <h2 class="title">📑 最近交易紀錄</h2>

      <!-- 桌面版表格 -->
      <div class="table-wrapper" v-if="!isMobile">
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
      </div>

      <!-- 手機版卡片 -->
      <div class="transaction-cards" v-else>
        <div v-for="row in filteredTransactions" :key="row.id" class="transaction-card">
          <div><strong>時間：</strong>{{ row.timestamp }}</div>
          <div><strong>商品：</strong>{{ row.product_name }}</div>
          <div>
            <strong>類型：</strong>
            <el-tag :type="row.type === 'in' ? 'success' : 'danger'">
              {{ row.type === 'in' ? '入庫' : '出庫' }}
            </el-tag>
          </div>
          <div><strong>數量：</strong>{{ row.quantity }}</div>
          <div><strong>備註：</strong>{{ row.note || '-' }}</div>
          <div><strong>操作人：</strong>{{ row.operator }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const products = ref([]);
const transactions = ref([]);
const form = ref({
  product_id: null,
  type: "in",
  quantity: 1,
  note: "",
});

const filter = ref({
  product_id: "",
  type: "",
});

const isMobile = ref(window.innerWidth <= 768);
window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 768;
});

const filteredTransactions = computed(() => {
  return transactions.value.filter((t) => {
    return (
      (!filter.value.type || t.type === filter.value.type) &&
      (!filter.value.product_id || t.product_id === filter.value.product_id)
    );
  });
});

function resetFilter() {
  filter.value.product_id = "";
  filter.value.type = "";
}

async function fetchProducts() {
  const res = await fetch("http://localhost:3000/products");
  products.value = await res.json();
  if (products.value.length) form.value.product_id = products.value[0].id;
}

async function fetchTransactions() {
  const res = await fetch("http://localhost:3000/transactions");
  transactions.value = await res.json();
}

async function handleSubmit() {
  const auth = useAuthStore();
  const role = auth.user?.role || "viewer";
  const username = auth.user?.username || "unknown";
  const res = await fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-role": role,
      "x-username": username,
    },
    body: JSON.stringify(form.value),
  });

  const result = await res.json();
  if (res.ok) {
    ElMessage.success("✅ 出入庫成功");
    form.value.quantity = 1;
    form.value.note = "";
    fetchTransactions();
  } else {
    ElMessage.error("❌ " + result.error);
  }
}

onMounted(() => {
  fetchProducts();
  fetchTransactions();
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
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
  margin-bottom: 12px;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 1.5rem;
}

.el-card {
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
  border: 1px solid #ebeef5;
  padding: 24px;
}

.filter-form {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.full-width {
  width: 100%;
}

.el-form-item {
  margin-bottom: 16px;
}

.el-button {
  font-weight: 500;
}

.el-table {
  margin-top: 1rem;
  border-radius: 8px;
}

.el-table th,
.el-table td {
  text-align: center;
}

.table-wrapper {
  overflow-x: auto;
}

.transaction-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.transaction-card {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background: #f9f9f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  font-size: 15px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }

  .main-card {
    padding: 16px;
    border-radius: 12px;
  }

  .filter-form {
    flex-direction: column;
    gap: 16px;
  }

  .el-form-item {
    width: 100%;
  }

  .el-select,
  .el-input,
  .el-input-number,
  .el-button {
    width: 100% !important;
  }

  .el-table {
    min-width: 600px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.3rem;
  }

  .el-button {
    font-size: 14px;
  }

  .el-form-item__label {
    font-size: 14px;
  }
}
</style>
