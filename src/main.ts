import { createApp } from 'vue'
import App from '@/ViteApp.vue'
import router from '@/router'
import { pinia } from '@/stores'
import './style.css'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
