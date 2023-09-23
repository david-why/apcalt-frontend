<script setup>
import { notify } from '../util/notification'
import service from '../util/request'
import { useGlobalStore } from '../util/storage'
</script>

<script>
export default {
  data() {
    return {
      store: useGlobalStore(),
      subjectId: this.$route.params.subjectId,
      resourceId: this.$route.params.resourceId,
      courseOutline: null,
      resource: null
    }
  },
  methods: {
    async markDone() {
      await service.post(
        '/subjects/' +
          this.subjectId +
          '/videos/' +
          this.resource.url +
          ':' +
          this.resource.videoId +
          '/finish'
      )
      notify('Marked video as finished')
    }
  },
  async mounted() {
    this.courseOutline = await this.store.getCourseOutline(this.subjectId)
    this.resource = this.store.getResource(this.subjectId, this.resourceId)
  }
}
</script>

<template>
  <p v-if="this.resource === null">Loading, please wait...</p>
  <div v-else>
    <iframe
      :src="'//fast.wistia.net/embed/iframe/' + this.resource.url"
      allow="fullscreen"
      allowfullscreen
      mozallowfullscreen
      webkitallowfullscreen
      oallowfullscreen
      msallowfullscreen
    ></iframe>
    <div><button @click="markDone">Mark as finished</button></div>
  </div>
</template>

<style scoped>
iframe {
  border: none;
  width: 600px;
  height: 400px;
}
</style>
