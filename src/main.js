import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import CKEditor from '@ckeditor/ckeditor5-vue';

createApp(App).use(createPinia()).use(router).use(CKEditor).mount('#app')
