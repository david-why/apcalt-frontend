import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import Ckeditor from '@ckeditor/ckeditor5-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Ckeditor)

app.mount('#app')
