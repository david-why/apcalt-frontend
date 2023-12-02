<script setup lang="ts">
import CenterContent from '@/components/layout/CenterContent.vue'
import router from '@/router';
import { getSubjects } from '@/service'
import { useLocalStore } from '@/stores';
import type { Subject } from '@/types'
import { onMounted, onUnmounted, ref } from 'vue'
const store = useLocalStore()

const subjects = ref([] as Subject[])
const ready = ref(false)

function chooseCommand(args: string) {
  const idx = parseInt(args)
  if (isNaN(idx)||idx<1||idx>subjects.value.length) {
    return
  }
  router.push({ name: 'subjectAssignments', params: { id: subjects.value[idx-1].id } })
}

onMounted(async () => {
  subjects.value = await getSubjects()
  ready.value = true
  store.addCommand('x', chooseCommand)
})
onUnmounted(() => {
  store.removeCommand('x', chooseCommand)
})
</script>

<template>
  <CenterContent>
    <h1>Subjects</h1>
    <p v-if="!ready">Loading subjects, please wait...</p>
    <p v-else-if="subjects?.length === 0">
      You have no AP subjects yet. Ask your teacher for the join code!
    </p>
    <table v-else>
      <tr v-for="subject in subjects" :key="subject.id">
        <td v-text="subject.name"></td>
        <td>
          <RouterLink :to="{ name: 'subjectAssignments', params: { id: subject.id } }"
            >Assignments</RouterLink
          >
        </td>
        <td>
          <RouterLink :to="{ name: 'outline', params: { id: subject.id } }">Outline</RouterLink>
        </td>
      </tr>
    </table>
  </CenterContent>
</template>
