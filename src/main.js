import './assets/main.css'

import CKEditor from '@ckeditor/ckeditor5-vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

createApp(App).use(createPinia()).use(router).use(CKEditor).mount('#app')
