<script setup>
import { router } from '../router'
import { notify } from '../util/notification'
import service from '../util/request'
import { useGlobalStore } from '../util/storage'
import FloppyDisk from './icons/FloppyDisk.vue'
import FolderUpload from './icons/FolderUpload.vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
</script>

<script>
export default {
  data() {
    return {
      editor: ClassicEditor,
      store: useGlobalStore(),
      subjectId: this.$route.params.subjectId,
      id: this.$route.params.id,
      review: this.$route.params.review === 'review',
      autosave: null,
      data: null,
      report: null,
      answers: null,
      responses: null,
      modified: {}
    }
  },
  computed: {
    baseUrl() {
      return (
        '/subjects/' + this.subjectId + '/assignments/' + this.id + (this.review ? '/review' : '')
      )
    },
    dirty() {
      return Object.keys(this.modified).length !== 0
    }
  },
  methods: {
    beforeWindowUnload(event) {
      if (this.dirty) {
        event.preventDefault()
      }
    },
    async setResponse(value, question) {
      const responseId = question.responseId
      if (question.type === 'mcq') {
        if (question.allowMultiple) {
          const elements = document.getElementsByName(responseId)
          const arr = []
          for (const element of elements) {
            if (element.checked) {
              arr.push(element.value)
            }
          }
          this.modified[responseId] = arr
        } else {
          this.modified[responseId] = [value]
        }
      } else if (question.type === 'longtextV2') {
        if (this.getResponse(responseId) !== value) {
          this.modified[responseId] = value
        }
      }
      if (this.autosave === null) {
        this.autosave = setTimeout(async () => {
          this.autosave = null
          await this.save(false)
          notify('Autosaved your responses')
        }, 60 * 1000)
      }
    },
    async save(notifyFinish = true) {
      const data = []
      for (const responseId in this.modified) {
        data.push({ id: responseId, response: this.modified[responseId] })
        this.responses[responseId] = this.modified[responseId]
      }
      this.modified = {}
      if (data.length === 0) {
        if (notifyFinish) {
          notify('Nothing to save!')
        }
        return
      }
      if (this.autosave !== null) {
        clearTimeout(this.autosave)
        this.autosave = null
      }
      await service.put(this.baseUrl + '/responses', data)
      if (notifyFinish) {
        notify('Saved responses')
      }
    },
    async dosubmit() {
      await this.save()
      this.responses = null
      await service.post(this.baseUrl + '/submit')
      notify('Submitted assignment')
      router.push({ path: '/subjects/' + this.subjectId })
    },
    async submit() {
      if (confirm('Are you sure you want to submit this assignment?')) {
        await this.dosubmit()
      }
    },
    getResponse(responseId) {
      if (this.modified[responseId] !== null && this.modified[responseId] !== undefined) {
        return this.modified[responseId]
      }
      return this.responses[responseId]
    },
    getReportItem(item) {
      const report = this.report[item.reference]
      return '(' + report.score + '/' + report.max_score + ')\xa0'
    },
    containsOption(responseId, option) {
      const response = this.getResponse(responseId)
      if (response === null || response === undefined) {
        return false
      }
      return response.includes(option)
    }
  },
  async mounted() {
    this.data = (await service.get(this.baseUrl)).data
    if (this.review) {
      this.report = (await service.get(this.baseUrl + '/report')).data
      this.answers = (await service.get(this.baseUrl + '/answers')).data
    }
    this.responses = (await service.get(this.baseUrl + '/responses')).data
    console.log(this.responses)
    window.addEventListener('beforeunload', this.beforeWindowUnload)
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.beforeWindowUnload)
    if (this.autosave !== null) {
      clearTimeout(this.autosave)
    }
  },
  beforeRouteLeave() {
    return (
      !this.dirty ||
      window.confirm('Are you sure you want to leave? Your responses are not saved yet.')
    )
  }
}
</script>

<template>
  <p v-if="data === null || responses === null">Loading, please wait...</p>
  <div v-else>
    <h1>{{ data.title }}<span v-if="review"> (review)</span></h1>
    <!-- &nbsp;<FloppyDisk class="button" @click="save"></FloppyDisk> -->
    <div v-if="!review">
      <button @click="save">Save</button>
      <button @click="submit">Submit</button>
    </div>
    <hr />
    <!-- <textarea rows="30" cols="30" v-text="data"></textarea> -->
    <ol id="items">
      <li class="item" v-for="(item, index) in data.items" :key="item.reference">
        <!-- <span v-if="review" v-text="getReportItem(item)" class="reportinfo"></span> -->
        <div class="question" v-for="question in item.questions" :key="question.responseId">
          <div
            v-if="
              question.sharedPassage !== null &&
              (index === 0 ||
                data.items[index - 1].questions[0].sharedPassage !== question.sharedPassage)
            "
          >
            <p v-html="question.sharedPassage"></p>
            <p>&nbsp;</p>
          </div>
          <p v-html="question.stimulus"></p>
          <div v-if="question.type === 'mcq'">
            <ol class="options">
              <li v-for="option in question.options" :key="option.value">
                <input
                  class="optionsel"
                  :name="question.responseId"
                  :type="question.allowMultiple ? 'checkbox' : 'radio'"
                  :value="option.value"
                  @input="setResponse(option.value, question)"
                  :checked="containsOption(question.responseId, option.value)"
                  :disabled="review"
                />
                <div
                  :class="
                    review && answers[question.responseId].includes(option.value) ? 'correct' : ''
                  "
                  v-html="option.label"
                ></div>
              </li>
            </ol>
          </div>
          <div v-else-if="question.type === 'longtextV2'">
            <!-- <textarea
              cols="80"
              rows="15"
              :name="question.responseId"
              @change="setResponse($event.target.value, question)"
              v-text="getResponse(question.responseId) || ''"
              :readonly="review"
            ></textarea> -->
            <Ckeditor
              class="frqeditor"
              :name="question.responseId"
              :editor="editor"
              :model-value="getResponse(question.responseId) || ''"
              @input="setResponse($event, question)"
              :disabled="review"
            ></Ckeditor>
          </div>
          <p v-else>Problem type {{ question.type }} not yet supported!</p>
        </div>
        <div
          v-if="
            index !== data.items.length - 1 &&
            (item.questions[0].sharedPassage === null ||
              data.items[index + 1].questions[0].sharedPassage !== item.questions[0].sharedPassage)
          "
          class="divider"
        ></div>
      </li>
    </ol>
    <div class="float" v-if="!review">
      <FloppyDisk class="button" size="36" @click="save"></FloppyDisk>
      <FolderUpload class="button" size="36" @click="submit"></FolderUpload>
    </div>
  </div>
</template>

<style scoped>
.button {
  cursor: pointer;
}
.options {
  list-style-type: upper-alpha;
}
.optionsel {
  vertical-align: middle;
  margin-right: 1em;
}
.reportinfo {
  color: red;
}
.item,
.question {
  width: 100%;
}
li {
  padding-left: 0.5em;
}
li > * {
  display: inline-table;
  vertical-align: top;
}
.correct {
  color: green;
}
li :deep(p) {
  padding: 0 0 0.2em 0;
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
</style>

<style>
.footnote_mark {
  display: none;
}
.footnote_text {
  font-style: italic;
  text-decoration: underline;
}
.footnote_text::before {
  content: ' (';
}
.footnote_text::after {
  content: ') ';
}
.mandatory_credit_block {
  font-style: italic;
}
.font_style\:italic {
  font-style: italic;
}
.passage-intro {
  font-weight: bold;
}
.ck-content {
  height: 250px;
}
</style>
