<script setup lang="ts">
import router from '@/router'
import { startAssignment } from '@/service'
import { useLocalStore } from '@/stores'
import type { Assignment, SubjectAssignment } from '@/types'
import { getProgress } from '@/utils/assignment'
import { formatDate } from '@/utils/time'
import { computed, onMounted, onUnmounted, ref } from 'vue'
const store = useLocalStore()

const props = defineProps({
  assignments: { type: Array<SubjectAssignment>, required: true },
  showSubject: { type: Boolean, default: false },
  status: String
})
const assignments = props.assignments

const actions = ref([] as HTMLTableCellElement[])

const sortBy = ref<keyof Assignment>('due_at')
const desc = ref(true)
const starting = ref(false)

const sortedAssignments = computed(() => {
  sortBy.value
  desc.value
  if (starting.value) {
    return []
  }
  if (assignments === undefined) {
    return []
  }
  return Array.of(...assignments).sort((a, b) => {
    const aKey = a[sortBy.value]
    const bKey = b[sortBy.value]
    return aKey === undefined
      ? 1
      : bKey === undefined
      ? -1
      : (aKey < bKey ? -1 : aKey === bKey ? 0 : 1) * (desc.value ? -1 : 1)
  })
})

async function doStartAssignment(assignment: SubjectAssignment) {
  starting.value = true
  await startAssignment(assignment.subject.id, assignment.id)
  router.push({
    name: 'assignment',
    params: { subjectId: assignment.subject.id, id: assignment.id }
  })
}

function chooseCommand(text: string) {
  const idx = parseInt(text)
  if (isNaN(idx) || idx < 1 || idx > actions.value.length) {
    return
  }
  const td: HTMLTableCellElement = actions.value[idx - 1]
  const a = td.querySelector('a')
  if (a !== null) {
    a.click()
  }
}

onMounted(() => {
  store.addCommand('x', chooseCommand)
})

onUnmounted(() => {
  store.removeCommand('x', chooseCommand)
})

defineExpose({ sortedAssignments, actions })
</script>

<template>
  <p v-if="starting">Starting assignment...</p>
  <blockquote v-else-if="sortedAssignments.length === 0">
    No assignments here. Give yourself a pat on the back!
  </blockquote>
  <template v-else>
    <p>
      Sort assignments by
      <select v-model="sortBy">
        <option v-if="showSubject" value="subject">subject</option>
        <option value="title">title</option>
        <option value="created_at">start time</option>
        <option value="due_at">due time</option>
      </select>
    </p>
    <p>
      <label for="desc-checkbox">Sort descending</label>
      <input id="desc-checkbox" type="checkbox" v-model="desc" />
    </p>
    <table class="main-table">
      <tr>
        <th v-if="showSubject">Subject</th>
        <th>Title</th>
        <th>Start time</th>
        <th>Due time</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      <tr v-for="assignment in sortedAssignments" :key="assignment.id" ref="rows">
        <td v-if="showSubject">
          <RouterLink
            :to="{
              name: 'subjectAssignments',
              params: { id: (assignment as SubjectAssignment).subject.id },
              query: { status }
            }"
          >
            {{ (assignment as SubjectAssignment).subject.name }}
          </RouterLink>
        </td>
        <td v-text="assignment.title"></td>
        <td>
          <time
            v-if="assignment.starts_at"
            :datetime="assignment.starts_at"
            v-text="formatDate(assignment.starts_at)"
          ></time>
        </td>
        <td>
          <time
            v-if="assignment.due_at"
            :datetime="assignment.due_at"
            v-text="formatDate(assignment.due_at)"
          ></time>
        </td>
        <td v-text="getProgress(assignment)"></td>
        <td ref="actions">
          <template
            v-if="
              (assignment.type === 'teacher-authored' || assignment.type === 'ppc') &&
              assignment.progress
            "
          >
            <RouterLink
              v-if="assignment.progress.started && assignment.status === 'opened'"
              :to="{
                name: 'assignment',
                params: { subjectId: assignment.subject.id, id: assignment.id }
              }"
              >Continue</RouterLink
            >
            <a
              href="javascript:;"
              @click="doStartAssignment(assignment)"
              v-if="assignment.progress.not_started && assignment.status === 'opened'"
              >Start</a
            >
            <RouterLink
              v-if="
                (assignment.progress.complete ||
                  assignment.progress.student_scored ||
                  assignment.progress.teacher_and_student_scored ||
                  assignment.progress.scored) &&
                !assignment.awaiting_scoring &&
                assignment.display_results
              "
              :to="{
                name: 'review',
                params: { subjectId: assignment.subject.id, id: assignment.id }
              }"
              >Review</RouterLink
            >
            <RouterLink
              v-if="assignment.progress.ready_to_score || assignment.progress.scoring"
              :to="{
                name: 'scoring',
                params: { subjectId: assignment.subject.id, id: assignment.id }
              }"
              >Score</RouterLink
            >
          </template>
          <template v-else-if="assignment.type === 'video'"></template>
        </td>
      </tr>
    </table>
  </template>
</template>

<style scoped>
.main-table {
  min-width: 60%;
}
</style>
