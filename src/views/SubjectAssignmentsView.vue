<script setup lang="ts">
import AssignmentList from '@/components/AssignmentList.vue'
import CenterContent from '@/components/layout/CenterContent.vue'
import router from '@/router'
import { getAssignments, getSubject } from '@/service'
import type { Subject, SubjectAssignment } from '@/types'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const subjectId = route.params.id as string
const status = ref(
  (route.query.status instanceof Array ? route.query.status[0] : route.query.status) || 'assigned'
)

watch([status], () => {
  router.push({ query: { status: status.value } })
})

const subject = ref<Subject>()
const assignments = ref<SubjectAssignment[]>()

function onKeyDown(event: KeyboardEvent) {
  if (event.target !== document.body) {
    return
  }
  let caught = true
  if (event.key === 'o') {
    router.push({ name: 'outline', params: { id: subjectId } })
  } else if (event.key === 'a') {
    router.push({ query: { status: 'assigned' } })
  } else if (event.key === 'u') {
    router.push({ query: { status: 'upcoming' } })
  } else if (event.key === 'c') {
    router.push({ query: { status: 'completed' } })
  } else {
    caught = false
  }
  if (caught) {
    event.preventDefault()
    event.stopPropagation()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown, true)
  try {
    subject.value = await getSubject(subjectId)
    assignments.value = await getAssignments(subjectId, status.value)
  } catch (e) {
    console.error('Error getting subject assignments', e)
    router.replace({ name: 'subjects' })
  }
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown, true)
})
</script>

<template>
  <CenterContent>
    <template v-if="subject !== undefined">
      <h1 v-text="subject.name"></h1>
      <p>
        <RouterLink :to="{ name: 'subjectAssignments', params: { id: subjectId } }"
          >Assignments</RouterLink
        >
        |
        <RouterLink :to="{ name: 'outline', params: { id: subjectId } }">Course outline</RouterLink>
      </p>
    </template>
    <p v-if="subject === undefined || assignments === undefined">Loading, please wait...</p>
    <template v-else>
      <p>
        <b>Assignment status </b>
        <select class="status-select" v-model="status">
          <option value="assigned">Assigned</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </p>
      <AssignmentList :assignments="assignments" :status="status"></AssignmentList>
    </template>
  </CenterContent>
</template>
