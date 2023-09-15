import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from './components/HomeView.vue'
import LoginView from './components/LoginView.vue'
import SubjectView from './components/SubjectView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/subjects/:id', component: SubjectView },
  { path: '/subjects/:subjectId/assignments/:id', component: () => import('./components/AssignmentView.vue') },
  { path: '/subjects/:subjectId/assignments/:id/:review', component: () => import('./components/AssignmentView.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})
