<script setup>
import { router } from '../router'
import { useGlobalStore } from '../util/storage'
</script>

<script>
export default {
  data() {
    return {
      store: useGlobalStore(),
      me: null,
      subjects: null
    }
  },
  async mounted() {
    if (!this.store.hasToken()) {
      router.push({ path: '/login' })
    }
    this.subjects = await this.store.getSubjects()
    this.me = await this.store.getMe()
    console.log(this.me)
  }
}
</script>

<template>
  <h1>Welcome!</h1>
  <p v-if="subjects === null">Loading subjects, please wait...</p>
  <div v-else>
    <!-- <textarea v-text="me"></textarea> -->
    <ul>
      <li v-for="subject in subjects" :key="subject.id">
        <RouterLink :to="'/subjects/' + subject.id">{{ subject.name }}</RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
