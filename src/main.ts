import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-sans/600.css'
import '@fontsource/geist-mono/500.css'
import '@fontsource/geist-mono/600.css'
import 'vue-sonner/style.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
