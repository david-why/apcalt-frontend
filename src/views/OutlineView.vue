<script setup lang="ts">
import WistiaComponent from '@/components/WistiaComponent.vue'
import CenterContent from '@/components/layout/CenterContent.vue'
import OverlayComponent from '@/components/layout/OverlayComponent.vue'
import RestrainWidth from '@/components/layout/RestrainWidth.vue'
import router from '@/router'
import { getOutline, getSignedUrl, getSubject } from '@/service'
import type { Outline, Subject } from '@/types'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const detailsList = ref([] as HTMLDetailsElement[])

const subjectId = route.params.id as string

const isExpanding = ref(true)
const videoUrl = ref<string>()

const subject = ref<Subject>()
const outline = ref<Outline>()
const signedUrls = ref({} as Record<string, string>)

const filteredUnits = computed(() => {
  if (outline.value === undefined) {
    return []
  }
  return outline.value.units
    .filter(
      (v) =>
        v.resources.length + v.subunits.map((u) => u.resources.length).reduce((p, c) => p + c) !== 0
    )
    .map((v) => {
      const unit = Object.assign({}, v)
      unit.subunits = v.subunits.filter((u) => u.resources.length !== 0)
      return unit
    })
})

function doWatch(url: string) {
  videoUrl.value = url
}

function onCloseVideo() {
  videoUrl.value = undefined
}

function onToggleAll() {
  for (const details of detailsList.value) {
    details.open = isExpanding.value
  }
  isExpanding.value = !isExpanding.value
}

function signUrls() {
  for (const unit of filteredUnits.value) {
    for (const subunit of unit.subunits) {
      for (const resource of subunit.resources) {
        if (resource.__typename === 'URLResource') {
          getSignedUrl(resource.url).then((url) => (signedUrls.value[resource.resourceId] = url))
        }
      }
    }
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.target !== document.body) {
    return
  }
  let caught = true
  if (event.key === 'a') {
    router.push({ name: 'subjectAssignments', params: { id: subjectId } })
  } else if (event.key === 't') {
    onToggleAll()
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
  subject.value = await getSubject(subjectId)
  if (subject.value === undefined) {
    router.push({ name: 'subjects' })
  }
  outline.value = await getOutline(subjectId)
  signUrls()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown, true)
})
</script>

<template>
  <RestrainWidth>
    <CenterContent v-if="subject !== undefined">
      <h1 v-text="subject.name"></h1>
      <p>
        <RouterLink :to="{ name: 'subjectAssignments', params: { id: subjectId } }"
          >Assignments</RouterLink
        >
        |
        <RouterLink :to="{ name: 'outline', params: { id: subjectId } }">Course outline</RouterLink>
      </p>
    </CenterContent>
    <CenterContent v-if="subject === undefined || outline === undefined"
      >Loading, please wait...</CenterContent
    >
    <template v-else>
      <p>
        <button @click="onToggleAll" v-text="isExpanding ? 'Expand all' : 'Collapse all'"></button>
      </p>
      <template v-for="unit in filteredUnits" :key="unit.unitId">
        <details class="unit" ref="detailsList">
          <summary>
            <h2 class="unit-summary">
              {{ unit.displayName }}{{ unit.title ? '. ' + unit.title : '' }}
            </h2>
          </summary>
          <p v-if="unit.examWeighting">AP Exam Weighting {{ unit.examWeighting }}</p>
          <template v-for="subunit in unit.subunits" :key="subunit.subunitId">
            <details class="subunit" ref="detailsList">
              <summary>
                <h3 class="subunit-summary">
                  {{
                    subunit.iconName === 'Circle'
                      ? unit.number + '.' + subunit.displayNumber + ' '
                      : ''
                  }}{{ subunit.displayName }}
                </h3>
              </summary>
              <ul>
                <li
                  class="resource"
                  v-for="resource of subunit.resources"
                  :key="resource.resourceId"
                >
                  <template v-if="resource.__typename === 'EmbeddedVideoResource'">
                    <b>[Video] {{ resource.displayName }} </b>
                    {{ resource.description }}
                    <button @click="doWatch(resource.url)">Watch</button>
                  </template>
                  <template v-else-if="resource.__typename === 'AssessmentResource'">
                    <b>[Progress check] </b>{{ resource.displayName }}
                  </template>
                  <template v-else-if="resource.__typename === 'URLResource'">
                    <b>[File] </b>
                    <a :href="signedUrls[resource.resourceId]">{{ resource.displayName }}</a>
                  </template>
                </li>
              </ul>
            </details>
          </template>
        </details>
      </template>
    </template>
    <OverlayComponent v-if="videoUrl" @close="onCloseVideo">
      <WistiaComponent :url="videoUrl"></WistiaComponent>
    </OverlayComponent>
  </RestrainWidth>
</template>

<style scoped>
.unit-summary,
.subunit-summary {
  display: inline;
}
.unit p {
  margin: 0.5em;
}
</style>
