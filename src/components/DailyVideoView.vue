<script>
import { useGlobalStore } from '../util/storage'

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
  async mounted() {
    try {
    this.courseOutline = await this.store.getCourseOutline(this.subjectId)
    this.resource = this.store.getResource(this.subjectId, this.resourceId)
    }catch(e){
      alert(e)
    }
  }
}
</script>

<template>
  <p v-if="resource === null">Loading, please wait...</p>
  <div v-else>
    <h1 v-text="resource.displayName"></h1>
    <iframe
      :src="'//fast.wistia.net/embed/iframe/' + resource.url"
      allow="fullscreen"
      allowfullscreen
      mozallowfullscreen
      webkitallowfullscreen
      oallowfullscreen
      msallowfullscreen
    ></iframe>
  </div>
</template>

<style scoped>
iframe {
  border: none;
  width: 600px;
  height: 400px;
}
</style>
