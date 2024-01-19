<script setup lang="ts">
import {
  getCategories,
  getRubric,
  getRubricResponses,
  getAssignment,
  setRubricResponses,
  submitScoring
} from '@/service'
import { useNotificationStore } from '@/stores'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import FolderUpload from './icons/FolderUpload.vue'
const notifyStore = useNotificationStore()
const router = useRouter()

const props = defineProps({
  subjectId: { type: String, required: true },
  assignmentId: { type: String, required: true }
})
const subjectId = props.subjectId
const assignmentId = props.assignmentId

const rubric = ref<Record<string, any>>()
const categories = ref<Record<string, string[]>>()
const assignment = ref<Record<string, any>>()
const responses = ref<Record<string, any>>()

const saving = ref(false)
const submitting = ref(false)

function findQuestion(reference: string) {
  if (categories.value === undefined || assignment.value === undefined) {
    return 'Unknown'
  }
  for (const category in categories.value) {
    if (categories.value[category].includes(reference)) {
      let i = 1
      for (const item of assignment.value.items) {
        if (item.reference === category) {
          return `Question ${i}`
        }
        i += 1
      }
      return 'Unknown'
    }
  }
  return 'Unknown'
}

function setScore(score: number, question: Record<string, any>) {
  if (responses.value === undefined) {
    return
  }
  if (responses.value[question.responseId]) {
    responses.value[question.responseId].score = score + ''
    const newCriteria = []
    for (const criteria of responses.value[question.responseId].criterias || []) {
      const parts = criteria.split(/_/g)
      const prevScore = Number(parts[1])
      const idx = Number(parts[2])
      const text = question.options[prevScore].criterias[idx].description
      const newText = question.options[score].criterias[idx].description
      if (text === newText) {
        newCriteria.push(`criteria_${score}_${idx}`)
      }
    }
    // responses.value[question.responseId] = Object.assign({}, responses.value[question.responseId], {
    //   criterias: newCriteria
    // })
    responses.value[question.responseId].criterias = newCriteria
  } else {
    responses.value = Object.assign({}, responses.value, {
      [question.responseId]: { score: score + '', criterias: [] }
    })
  }
  doSave()
}

function setCriteria(idx: number, question: Record<string, any>) {
  if (responses.value === undefined) {
    return
  }
  const key = `criteria_${responses.value[question.responseId].score}_${idx}`
  if (responses.value[question.responseId].criterias.includes(key)) {
    const loc = responses.value[question.responseId].criterias.indexOf(key)
    responses.value[question.responseId].criterias.splice(loc, 1)
  } else {
    responses.value[question.responseId].criterias.push(key)
  }
  doSave()
}

async function save() {
  if (responses.value === undefined) {
    return false
  }
  saving.value = true
  try {
    await setRubricResponses(subjectId, assignmentId, responses.value)
  } catch (e) {
    console.error('Error saving rubric responses', e)
    alert('Saving your scoring responses failed!')
    return false
  } finally {
    saving.value = false
  }
  return true
}

async function doSave() {
  if (saving.value) {
    return true
  }
  if (await save()) {
    notifyStore.notify('Saved your scoring responses')
    return true
  } else {
    return false
  }
}

async function submit() {
  if (saving.value) {
    await new Promise<void>((resolve) => {
      const cancel = watch([saving], () => {
        if (!saving.value) {
          cancel()
          resolve()
        }
      })
    })
  }
  if (!(await doSave())) {
    return false
  }
  submitting.value = true
  try {
    await submitScoring(subjectId, assignmentId)
  } catch (e) {
    console.error('Error submitting rubric responses', e)
    alert('Submitting failed!')
    return false
  } finally {
    submitting.value = false
  }
  return true
}

async function doSubmit() {
  if (submitting.value) {
    return
  }
  if (confirm('Are you sure you want to submit scoring? This cannot be changed later!')) {
    if (await submit()) {
      router.push({ name: 'subjectAssignments', params: { id: subjectId } })
      notifyStore.notify('Submitted your scoring')
      return true
    } else {
      return false
    }
  }
  return false
}

onMounted(async () => {
  rubric.value = await getRubric(subjectId, assignmentId)
  categories.value = await getCategories(subjectId, assignmentId)
  assignment.value = await getAssignment(subjectId, assignmentId, 2)
  responses.value = await getRubricResponses(subjectId, assignmentId)
})
</script>

<template>
  <div v-if="!rubric">Loading rubric, please wait...</div>
  <div v-else-if="!assignment">Loading assignment, please wait...</div>
  <div v-else-if="!responses">Loading scoring responses, please wait...</div>
  <template v-else>
    <!-- <textarea v-text="rubric"></textarea>
    <textarea v-text="responses"></textarea> -->
    <div class="item" v-for="item in rubric.items" :key="item.reference" ref="itemsEl">
      <div v-for="question in item.questions" :key="question.responseId">
        <h2>{{ findQuestion(item.reference) }} - {{ question.title }}</h2>
        <div v-html="question.stimulus"></div>
        <ul>
          <li v-for="option in question.options" :key="option.value">
            <input
              :name="question.responseId"
              :value="option.value"
              @input="setScore(option.value, question)"
              :checked="(responses[question.responseId] || {}).score === option.value + ''"
              type="radio"
            />
            {{ option.label }}
          </li>
        </ul>
        <template v-if="responses[question.responseId]">
          <div
            v-html="question.options[Number(responses[question.responseId].score)].description"
          ></div>
          <ul>
            <li
              v-for="(criteria, idx) in question.options[
                Number(responses[question.responseId].score)
              ].criterias"
              :key="criteria.description"
            >
              <input
                :name="question.responseId + '_criterias'"
                :value="criteria.description"
                @input="setCriteria(idx, question)"
                :checked="
                  (responses[question.responseId].criterias || []).includes(
                    `criteria_${responses[question.responseId].score}_${idx}`
                  )
                "
                type="checkbox"
              />
              <span v-html="criteria.description"></span>
            </li>
          </ul>
          <!-- <textarea rows="10" cols="40" v-text="responses[question.responseId]"></textarea> -->
        </template>
        <!-- <textarea rows="50" cols="50" v-text="item"></textarea> -->
      </div>
    </div>
    <div class="float">
      <FolderUpload class="button" :size="36" @click="doSubmit"></FolderUpload>
    </div>
  </template>
</template>

<style scoped>
.item :deep(p) {
  margin: 0;
}
.float {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
