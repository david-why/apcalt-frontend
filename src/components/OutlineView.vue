<script setup>
import { router } from '../router'
import { useGlobalStore } from '../util/storage'
</script>

<script>
export default {
  data() {
    return {
      store: useGlobalStore(),
      id: this.$route.params.subjectId,
      subject: null,
      outline: null
    }
  },
  computed: {
    units() {
      if (this.outline === null) return []
      const units = []
      for (const unit of this.outline.units) {
        let ok = false
        for (const subunit of unit.subunits) {
          if (subunit.resources && subunit.resources.length) {
            ok = true
            break
          }
        }
        if (!ok) continue
        units.push(unit)
      }
      return units
    }
  },
  async mounted() {
    const subjects = await this.store.getSubjects()
    for (const subject of subjects) {
      if (subject.id === this.id) {
        this.subject = subject
      }
    }
    if (this.subject === null) {
      router.push({ path: '/' })
    }
    this.outline = await this.store.getCourseOutline(this.id)
  }
}
</script>

<template>
  <template v-if="outline === null">Loading, please wait...</template>
  <template v-else>
    <h1 v-text="subject.name"></h1>
    <div v-for="unit in outline.units" :key="unit.unitId">
      <h2>{{ unit.displayName }}. {{ unit.title }}</h2>
      <template v-for="subunit in unit.subunits" :key="subunit.subunitId">
        <div v-if="subunit.resources.length">
          <ul>
            <template v-for="resource in subunit.resources" :key="resource.resourceId">
              <!-- <li></textarea v-text="resource" rows="10" cols="35"></textarea></li> -->
              <li v-if="resource.__typename === 'EmbeddedVideoResource' && resource.displayName">
                Daily video:
                <RouterLink
                  :to="{ path: '/subjects/' + id + '/dailyVideo/' + resource.resourceId }"
                >
                  {{ resource.displayName }}
                </RouterLink>
              </li>
              <li v-else-if="resource.__typename === 'AssessmentResource'">
                Progress check {{ resource.displayName }}
              </li>
              <li v-else-if="resource.__typename === 'URLResource'">
                File (not working right now): <a :href="resource.url">{{ resource.displayName }}</a>
              </li>
              <li v-else-if="resource.displayName">
                Unknown {{ resource.__typename }}: {{ resource.displayName }}
                <pre style="max-width: 100%" v-text="resource"></pre>
              </li>
            </template>
          </ul>
          <!-- <textarea v-text="subunit" rows="10" cols="40"></textarea> -->
        </div>
      </template>
      <!-- <textarea v-text="unit" rows="10" cols="50"></textarea> -->
    </div>
  </template>
</template>
