import AssignmentView from '@/views/AssignmentView.vue'
import AssignmentsView from '@/views/AssignmentsView.vue'
import HelpView from '@/views/HelpView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import OutlineView from '@/views/OutlineView.vue'
import ReviewView from '@/views/ReviewView.vue'
import ScoringView from '@/views/ScoringView.vue'
import SubjectAssignmentsView from '@/views/SubjectAssignmentsView.vue'
import SubjectsView from '@/views/SubjectsView.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/help',
      name: 'help',
      component: HelpView
    },
    {
      path: '/assignments',
      name: 'assignments',
      component: AssignmentsView
    },
    {
      path: '/subjects',
      name: 'subjects',
      component: SubjectsView
    },
    {
      path: '/subjects/:id/outline',
      name: 'outline',
      component: OutlineView
    },
    {
      path: '/subjects/:id/assignments',
      name: 'subjectAssignments',
      component: SubjectAssignmentsView
    },
    {
      path: '/subjects/:subjectId/assignments/:id',
      name: 'assignment',
      component: AssignmentView
    },
    {
      path: '/subjects/:subjectId/assignments/:id/review',
      name: 'review',
      component: ReviewView
    },
    {
      path: '/subjects/:subjectId/assignments/:id/scoring',
      name: 'scoring',
      component: ScoringView
    }
  ]
})

export default router
