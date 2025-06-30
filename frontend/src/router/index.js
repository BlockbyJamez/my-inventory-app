import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import ProductList from '@/components/ProductList.vue'
import ProductForm from '@/components/ProductForm.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/products', name: 'ProductList', component: ProductList, meta: { requiresAuth: true } },
  { path: '/add', name: 'ProductForm', component: ProductForm, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/forgot-password', component: ForgotPassword },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // 未登入者禁止進入需要登入的頁面
  if (to.meta.requiresAuth && !auth.user) {
    next('/login')
  }
  // 已登入者禁止再進入 login 頁面
  else if (to.path === '/login' && auth.user) {
    next('/')
  }
  // 限 admin 的頁面，viewer 不可進入
  else if (to.meta.requiresAdmin && auth.user?.role !== 'admin') {
    alert('此頁面僅限管理員使用')
    next('/products')
  }
  else {
    next()
  }
})

export default router
