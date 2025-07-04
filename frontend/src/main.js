import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

import { createPinia } from 'pinia'
import router from './router/routes'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

function setResponsiveClass() {
  const isMobile = window.innerWidth <= 768
  document.body.classList.toggle('is-mobile', isMobile)
  document.body.classList.toggle('is-desktop', !isMobile)
}
setResponsiveClass()
window.addEventListener('resize', setResponsiveClass)

app.mount('#app')
