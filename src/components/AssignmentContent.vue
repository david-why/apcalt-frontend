<script setup lang="ts">
import FloppyDisk from '@/components/icons/FloppyDisk.vue'
import FolderUpload from '@/components/icons/FolderUpload.vue'
import router from '@/router'
import {
  getAnswers,
  getAssignment,
  getReport,
  getResponses,
  getTimed,
  setResponses,
  submit
} from '@/service'
import { useLocalStore, useNotificationStore } from '@/stores'
import { formatDuration } from '@/utils/time'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import CenterContent from './layout/CenterContent.vue'
import RestrainWidth from './layout/RestrainWidth.vue'
const notifyStore = useNotificationStore()
const store = useLocalStore()

/*declare interface UploadConfig {
  responseId: string
}

class MyUploadAdapter implements UploadAdapter {
  loader: FileLoader
  config: UploadConfig
  xhr?: XMLHttpRequest
  constructor(loader: FileLoader, config: UploadConfig) {
    this.loader = loader
    this.config = config
  }
  async upload(): Promise<Record<string, any>> {
    const file = await this.loader.file
    if (file === null) {
      throw 'Failed to upload file'
    }
    return new Promise((resolve, reject) => {
      const xhr = (this.xhr = new XMLHttpRequest())
      xhr.open(
        'POST',
        `${
          import.meta.env.VITE_BACKEND_URL
        }/subjects/${subjectId}/assignments/${assignmentId}/upload`,
        true
      )
      xhr.responseType = 'json'
      xhr.addEventListener('error', () => {
        reject('Error in uploading file')
      })
      xhr.addEventListener('abort', () => {
        reject('Upload aborted')
      })
      xhr.addEventListener('load', () => {
        const response = xhr.response
        if (response.code !== 200) {
          reject(response.msg || 'Failed to upload file')
        }
        resolve(response.data)
      })
      const data = new FormData()
      data.append('file', file)
      data.append('responseId', this.config.responseId)
      data.append('assignmentId', assignmentId)
      xhr.send(data)
    })
  }
  abort(): void {
    this.xhr?.abort()
  }
}

function getPlugin(responseId: string) {
  class MyUploadAdapterPlugin {
    constructor(editor: Editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader, { responseId })
      }
    }
  }
  return MyUploadAdapterPlugin
}*/

const props = defineProps({
  subjectId: { type: String, required: true },
  assignmentId: { type: String, required: true },
  review: { type: Boolean, default: false }
})

const subjectId = props.subjectId
const assignmentId = props.assignmentId
const isReview = props.review

const assignment = ref<Record<string, any>>()
const report = ref<Record<string, any>>()
const answers = ref<Record<string, any>>()
const responses = ref({} as Record<string, any>)
const responsesLoaded = ref(false)

const endTime = ref<number>()
const secondsLeft = ref<number>()

const autosaveTimer = ref<number>()
const timedTimer = ref<number>()
const countdownTimer = ref<number>()

const lastJump = ref(0)
const submitting = ref(false)
const dirty = ref(false)
const saving = ref(false)
const forceLeave = ref(false)

const itemsEl = ref([] as HTMLLIElement[])

const cannotLeave = computed(() => {
  dirty.value
  saving.value
  forceLeave.value
  return (dirty.value || saving.value) && !forceLeave.value
})

function beforeUnload(event: BeforeUnloadEvent) {
  if (cannotLeave.value) {
    doSave()
    if (event.cancelable) {
      event.preventDefault()
    }
  }
}

async function updateTimed() {
  const timed = await getTimed(subjectId, assignmentId)
  if (timed.totalTime) {
    endTime.value = Date.now() / 1000 + timed.totalTime - timed.timeElapsed
    if (!timedTimer.value) {
      timedTimer.value = setInterval(updateTimed, 30000)
    }
    if (!countdownTimer.value) {
      countdownTimer.value = setInterval(() => {
        if (!endTime.value) {
          return
        }
        secondsLeft.value = Math.floor(endTime.value - Date.now() / 1000)
        if (secondsLeft.value < 0) {
          alert('The allotted time for this assignment has passed.')
          forceLeave.value = true
          router.push({ name: 'subjectAssignments', params: { id: subjectId } })
        }
      }, 1000)
    }
  }
}

async function save() {
  if (saving.value) {
    return
  }
  saving.value = true
  if (autosaveTimer.value) {
    clearTimeout(autosaveTimer.value)
    autosaveTimer.value = undefined
  }
  try {
    dirty.value = false
    await setResponses(subjectId, assignmentId, responses.value || {})
  } catch (e) {
    dirty.value = true
    console.error('Error saving responses', e)
    alert('Saving your responses failed! Please try saving again manually to prevent data loss!')
    return false
  } finally {
    saving.value = false
  }
  return true
}

async function doSave() {
  if (await save()) {
    notifyStore.notify('Saved responses')
    return true
  } else {
    return false
  }
}

async function doSubmit() {
  if (confirm('Are you sure you want to submit this assignment?')) {
    submitting.value = true
    try {
      await doSave()
      await submit(subjectId, assignmentId)
      notifyStore.notify('Submitted assignment')
    } catch (e) {
      console.error('Error submitting assignment', e)
      alert(
        'There was a problem submitting this assignment. Please check if it was submitted successfully.'
      )
    }
    router.push({ name: 'subjectAssignments', params: { id: subjectId } })
  }
}

function setResponse(value: string, question: Record<string, any>) {
  if (isReview) {
    return
  }
  const responseId: string = question.responseId
  if (question.type === 'mcq') {
    const selected = []
    if (question.allowMultiple) {
      // const elements = document.getElementsByName(responseId) as NodeListOf<HTMLInputElement>
      // for (const element of elements) {
      //   if (element.checked) {
      //     selected.push(element.value)
      //   }
      // }
      selected.push(...((responses.value || {})[responseId] || []))
      if (selected.includes(value)) {
        selected.splice(selected.indexOf(value), 1)
      } else {
        selected.push(value)
      }
    } else {
      selected.push(value)
    }
    responses.value = Object.assign({}, responses.value, { [responseId]: selected })
  } else if (question.type === 'longtextV2') {
    responses.value = Object.assign({}, responses.value, { [responseId]: value })
  }
  dirty.value = true
  if (!autosaveTimer.value) {
    autosaveTimer.value = setTimeout(async () => {
      await save()
      notifyStore.notify('Autosaved responses')
    }, 60000)
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.target !== document.body) {
    return
  }
  let caught = true
  if (event.key === 'ArrowRight') {
    nextCommand()
  } else if (event.key === 'ArrowLeft') {
    prevCommand()
  } else if (
    event.key === 'a' ||
    event.key === 'b' ||
    event.key === 'c' ||
    event.key === 'd' ||
    event.key === 'e'
  ) {
    choiceCommand(lastJump.value + ' ' + event.key)
  } else if (!isReview && event.key === 'v') {
    if (!event.repeat) {
      doSave()
    }
  } else {
    caught = false
  }
  if (caught) {
    event.stopPropagation()
  }
}

function jumpCommand(args: string) {
  const idx = parseInt(args)
  if (isNaN(idx) || idx < 1 || idx > itemsEl.value.length) {
    return
  }
  lastJump.value = idx
  const li = itemsEl.value[idx - 1]
  window.scroll(0, li.offsetTop - 100)
}

function choiceCommand(args: string) {
  const parts = args.split(' ', 2)
  if (parts.length === 1) {
    parts.unshift('' + lastJump.value)
  }
  const qid = parts[0]
  const qparts = qid.split('.')
  const idx = parseInt(qparts[0]) - 1
  const qidx = qparts.length > 1 ? parseInt(qparts[1]) - 1 : 0
  const question = assignment.value?.items[idx].questions[qidx]
  if (question.type === 'mcq') {
    const choice = parts[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)
    const cid = question.options[choice].value
    if (isReview) {
      const details = itemsEl.value[idx]
        .querySelectorAll('div.question')
        [qidx].querySelectorAll('li.option')
        [choice].querySelector('details')
      if (details !== null) {
        details.open = !details.open
      }
    } else {
      setResponse(cid, question)
    }
  } else {
    setResponse(parts[1], question)
  }
}

function nextCommand() {
  const jump = lastJump.value + 1
  jumpCommand('' + jump)
}

function prevCommand() {
  const jump = lastJump.value - 1
  if (jump >= 1) {
    jumpCommand('' + jump)
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', beforeUnload)
  try {
    assignment.value = await getAssignment(subjectId, assignmentId, isReview)
    if (isReview) {
      report.value = await getReport(subjectId, assignmentId)
      answers.value = await getAnswers(subjectId, assignmentId)
    } else {
      await updateTimed()
    }
    responses.value = await getResponses(subjectId, assignmentId, isReview)
    responsesLoaded.value = true
  } catch (e) {
    console.error('Error loading assignment', e)
    router.push({ name: 'subjectAssignments', params: { id: subjectId } })
  }
  store.addCommand('j', jumpCommand)
  store.addCommand('n', nextCommand)
  store.addCommand('p', prevCommand)
  if (!isReview) {
    store.addCommand('x', choiceCommand)
    store.addCommand('v', doSave)
    store.addCommand('t', doSubmit)
  }
  window.addEventListener('keydown', onKeyDown, true)
})

onUnmounted(() => {
  store.removeCommand('j', jumpCommand)
  store.removeCommand('n', nextCommand)
  store.removeCommand('p', prevCommand)
  if (!isReview) {
    store.removeCommand('x', choiceCommand)
    store.removeCommand('v', doSave)
    store.removeCommand('t', doSubmit)
  }
  window.removeEventListener('beforeunload', beforeUnload)
  window.removeEventListener('keydown', onKeyDown, true)
  if (autosaveTimer.value) {
    clearTimeout(autosaveTimer.value)
  }
  if (timedTimer.value) {
    clearInterval(timedTimer.value)
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})

onBeforeRouteLeave(() => {
  if (!cannotLeave.value) {
    return true
  }
  doSave()
  return confirm('Are you sure you want to leave? Your responses are not saved yet.')
})
</script>

<template>
  <RestrainWidth>
    <p v-if="!assignment">Loading assignment, please wait...</p>
    <p v-else-if="!responsesLoaded">Loading your responses, please wait...</p>
    <p v-else-if="submitting">Submitting, please wait...</p>
    <template v-else>
      <CenterContent>
        <h1 v-text="assignment.title"></h1>
      </CenterContent>
      <ol class="items">
        <li
          class="item"
          v-for="(item, itemIndex) in assignment.items"
          :key="item.reference"
          :class="itemIndex + 1 === lastJump ? ['curjump'] : []"
          ref="itemsEl"
        >
          <div class="question" v-for="question in item.questions" :key="question.responseId">
            <div
              v-if="
                question.sharedPassage &&
                (itemIndex === 0 ||
                  assignment.items[itemIndex - 1].questions[0].sharedPassage !==
                    question.sharedPassage)
              "
            >
              <p class="apctext" v-html="question.sharedPassage"></p>
              <p>&nbsp;</p>
            </div>
            <p class="apctext" v-html="question.stimulus"></p>
            <div v-if="question.type === 'mcq'">
              <ol class="options">
                <li
                  class="option"
                  v-for="(option, optindex) in question.options"
                  :key="option.value"
                  :class="
                    answers && answers[question.responseId].includes(option.value) ? 'correct' : ''
                  "
                >
                  <input
                    class="option-input"
                    :name="question.responseId"
                    :type="question.allowMultiple ? 'checkbox' : 'radio'"
                    :value="option.value"
                    @input="setResponse(option.value, question)"
                    :checked="(responses[question.responseId] || []).includes(option.value)"
                    :disabled="review"
                  />
                  <div class="apctext" v-html="option.label"></div>
                  <template
                    v-if="
                      review &&
                      (question.metadata.custom_distractor_rationale_response_level ||
                        question.metadata.distractor_rationale_response_level) &&
                      (question.metadata.custom_distractor_rationale_response_level ||
                        question.metadata.distractor_rationale_response_level)[optindex]
                    "
                  >
                    <br />
                    <div>
                      <details>
                        <summary>Explanation</summary>
                        <p
                          v-html="
                            (question.metadata.custom_distractor_rationale_response_level ||
                              question.metadata.distractor_rationale_response_level)[optindex]
                          "
                        ></p>
                      </details>
                    </div>
                  </template>
                </li>
              </ol>
            </div>
            <div v-else-if="question.type === 'longtextV2'">
              <Ckeditor
                class="frqeditor"
                :name="question.responseId"
                :editor="ClassicEditor"
                :model-value="responses[question.responseId] || ''"
                @input="setResponse($event, question)"
                :disabled="review"
                :config="{
                  //extraPlugins: [getPlugin(question.responseId)]
                }"
              ></Ckeditor>
            </div>
            <p v-else>
              Question type {{ question.type }} is unknown! Here is the raw question data:
              <textarea v-text="question"></textarea>
            </p>
          </div>
          <div
            v-if="
              itemIndex !== assignment.items.length - 1 &&
              (!item.questions[0].sharedPassage ||
                assignment.items[itemIndex + 1].questions[0].sharedPassage !==
                  item.questions[0].sharedPassage)
            "
            class="divider"
          ></div>
        </li>
      </ol>
    </template>
  </RestrainWidth>
  <div class="float" v-if="!review">
    <span v-if="secondsLeft !== undefined" v-text="formatDuration(secondsLeft)"></span>
    <FloppyDisk class="button" :size="36" @click="doSave"></FloppyDisk>
    <FolderUpload class="button" :size="36" @click="doSubmit"></FolderUpload>
  </div>
</template>

<style scoped>
:deep(p) {
  margin: 0;
}

.button {
  cursor: pointer;
}

.options {
  list-style-type: upper-alpha;
}

.option-input {
  vertical-align: middle;
  margin-right: 1em;
}

.item,
.question {
  width: 100%;
}

.question {
  padding-bottom: 0.2em;
}

.item,
.option {
  padding-left: 0.5em;
  box-sizing: border-box;
}

.item > *,
.option > * {
  display: inline-table;
  vertical-align: top;
}

.correct {
  color: green;
}

.curjump {
  border-left: solid 1px orange;
  padding-left: calc(0.5em - 1px);
}

.item :deep(p),
.option :deep(p) {
  padding-bottom: 0.2em;
}

.float {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
}

.divider {
  height: 1px;
  width: 100%;
  background-color: #555;
  margin: 0.5em;
}

:deep(.ck-content) {
  height: 200px;
}

.apctext :deep(.footnote_mark) {
  display: none;
}

.apctext :deep(.footnote_text) {
  font-style: italic;
  text-decoration: underline;
}

.apctext :deep(.footnote_text::before) {
  content: ' (';
}

.apctext :deep(.footnote_text::after) {
  content: ') ';
}

.apctext :deep(.mandatory_credit_block) {
  font-style: italic;
}

.apctext :deep(.font_style\:italic) {
  font-style: italic;
}

.apctext :deep(.text_decoration\:underline) {
  text-decoration: underline;
}

.apctext :deep(.passage-intro) {
  font-weight: bold;
}

.apctext :deep(.mandatory_credit_line) {
  display: block;
  font-size: smaller;
}

.apctext :deep(.standalone_image) > img {
  max-width: 65%;
  max-height: 65vh;
  margin: 0 auto 0 0;
  object-position: left top;
  object-fit: contain;
  -o-object-fit: contain;
}

.apctext :deep(.title_line) {
  font-weight: bold;
}

.apctext :deep(.placeholder)::before {
  content: '________';
}

.apctext :deep(.formatted_line_break) {
  display: block;
}
</style>
