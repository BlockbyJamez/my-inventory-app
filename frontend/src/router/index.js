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
  { path: '/add', name: 'ProductForm', component: ProductForm, meta: { requiresAuth: true } },
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

  if (to.meta.requiresAuth && !auth.user) {
    next('/login')
  } else if (to.path === '/login' && auth.user) {
    next('/')
  } else {
    next()
  }
})

export default router
