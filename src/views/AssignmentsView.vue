<script setup lang="ts">
import AssignmentList from '@/components/AssignmentList.vue'
import CenterContent from '@/components/layout/CenterContent.vue'
import router from '@/router'
import { getAllAssignments } from '@/service'
import type { Subject, SubjectAssignment } from '@/types'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const DESTROYED = {}

const counter = ref(0)
const destroyed = ref(false)

const status = ref(
  (route.query.status instanceof Array ? route.query.status[0] : route.query.status) || 'assigned'
)

const loadingName = ref<HTMLSpanElement>()
const assignments = ref<SubjectAssignment[]>()

function onStatusChange() {
  router.push({ query: { status: status.value } })
}

function callback(subject: Subject) {
  if (destroyed.value) {
    throw DESTROYED
  }
  if (loadingName.value) {
    loadingName.value.textContent = subject.name + ' assignments'
  }
}

onMounted(async () => {
  destroyed.value = false
  const cur = ++counter.value
  try {
    const curAssignments = await getAllAssignments({ callback, status: status.value })
    if (cur === counter.value) {
      assignments.value = curAssignments
    }
  } catch (e) {
    if (e != DESTROYED) {
      console.error(e)
    }
  }
})
onUnmounted(() => {
  destroyed.value = true
})
</script>

<template>
  <CenterContent>
    <h1>
      All
      <select class="status-select" v-model="status" @change="onStatusChange">
        <option value="assigned">assigned</option>
        <option value="upcoming">upcoming</option>
        <option value="completed">completed</option>
      </select>
      assignments
    </h1>
    <p v-if="assignments === undefined">
      Loading <span ref="loadingName">subjects</span>, please wait...
    </p>
    <AssignmentList
      v-else
      :assignments="assignments"
      show-subject
      :status="status"
    ></AssignmentList>
  </CenterContent>
</template>

<style scoped>
.status-select {
  font-size: inherit;
}
</style>
