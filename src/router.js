import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from './components/HomeView.vue'
import LoginView from './components/LoginView.vue'
import SubjectView from './components/SubjectView.vue'
import AssignmentView from './components/AssignmentView.vue'
import VideoView from './components/VideoView.vue'
import OutlineView from './components/OutlineView.vue'
import DailyVideoView from './components/DailyVideoView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/subjects/:id', component: SubjectView },
  { path: '/subjects/:subjectId/assignments/:id', component: AssignmentView },
  { path: '/subjects/:subjectId/assignments/:id/:review', component: AssignmentView },
  { path: '/subjects/:subjectId/videos/:resourceId', component: VideoView },
  { path: '/subjects/:subjectId/outline', component: OutlineView },
  { path: '/subjects/:subjectId/dailyVideo/:resourceId', component: DailyVideoView }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})
