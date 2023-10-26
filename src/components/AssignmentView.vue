<script setup>
import { router } from '../router'
import { notify } from '../util/notification'
import service from '../util/request'
import { useGlobalStore } from '../util/storage'
import strftime from '../util/strftime'
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
      timed: null,
      endTime: null,
      secondsLeft: null,
      timedTimer: null,
      countdownTimer: null,
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
      console.log('dirty?', Object.keys(this.modified).length)
      return Object.keys(this.modified).length !== 0
    },
    timeLeft() {
      return new Date(this.secondsLeft * 1000)
      // return new Date(
      //   1970,
      //   0,
      //   1,
      //   Math.floor(this.secondsLeft / 3600),
      //   Math.floor(this.secondsLeft / 60),
      //   this.secondsLeft % 60
      // )
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
    async updateTimed() {
      this.timed = (await service.get(this.baseUrl + '/timed')).data
      if (this.timed.totalTime !== null) {
        this.endTime = Date.now() / 1000 + this.timed.totalTime - this.timed.timeElapsed
        console.log('end time : ', this.endTime)
        if (this.timedTimer === null) {
          this.timedTimer = setInterval(this.updateTimed, 30000)
        }
        if (this.countdownTimer === null) {
          this.countdownTimer = setInterval(() => {
            this.secondsLeft = Math.floor(this.endTime - Date.now() / 1000)
            if (this.secondsLeft <= 0) {
              alert('The allotted time for this assignment has passed.')
              router.push({ path: '/subjects/' + this.subjectId })
            }
            // const endTime = this.endTime
            // this.endTime = endTime
          }, 1000)
        }
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
    window.addEventListener('beforeunload', this.beforeWindowUnload)
    this.data = (await service.get(this.baseUrl)).data
    if (this.review) {
      this.report = (await service.get(this.baseUrl + '/report')).data
      this.answers = (await service.get(this.baseUrl + '/answers')).data
    } else {
      this.updateTimed()
    }
    this.responses = (await service.get(this.baseUrl + '/responses')).data
    console.log(this.responses)
  },
  unmounted() {
    window.removeEventListener('beforeunload', this.beforeWindowUnload)
    if (this.autosave !== null) {
      clearTimeout(this.autosave)
    }
    if (this.timedTimer !== null) {
      clearTimeout(this.timedTimer)
    }
    if (this.countdownTimer !== null) {
      clearTimeout(this.countdownTimer)
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
    <div v-if="!review">
      <button @click="save">Save</button>
      <button @click="submit">Submit</button>
    </div>
    <hr />
    <ol id="items">
      <li class="item" v-for="(item, index) in data.items" :key="item.reference">
        <div class="question" v-for="question in item.questions" :key="question.responseId">
          <div
            v-if="
              question.sharedPassage !== null &&
              (index === 0 ||
                data.items[index - 1].questions[0].sharedPassage !== question.sharedPassage)
            "
          >
            <p class="apctext" v-html="question.sharedPassage"></p>
            <p>&nbsp;</p>
          </div>
          <p class="apctext" v-html="question.stimulus"></p>
          <div v-if="question.type === 'mcq'">
            <ol class="options">
              <li
                v-for="(option, optindex) in question.options"
                :key="option.value"
                :class="
                  review && answers[question.responseId].includes(option.value) ? 'correct' : ''
                "
              >
                <input
                  class="optionsel"
                  :name="question.responseId"
                  :type="question.allowMultiple ? 'checkbox' : 'radio'"
                  :value="option.value"
                  @input="setResponse(option.value, question)"
                  :checked="containsOption(question.responseId, option.value)"
                  :disabled="review"
                />
                <div v-html="option.label"></div>
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
      <span v-if="secondsLeft !== null" v-text="strftime('%M:%S', timeLeft)"></span>
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
.frqeditor :deep(.ck-content) {
  height: 250px;
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
</style>
