<script setup lang="ts">
import RestrainCenter from '@/components/layout/RestrainCenter.vue'
import router from '@/router'
import { useLocalStore } from '@/stores'
import { onMounted, onUnmounted } from 'vue'
const store = useLocalStore()

function helpCommand() {
  router.push({ name: 'help' })
}

onMounted(() => {
  store.addCommand('h', helpCommand)
})
onUnmounted(() => {
  store.removeCommand('h', helpCommand)
})
</script>

<template>
  <RestrainCenter>
    <h1>Welcome to APCAlt!</h1>
    <blockquote>A better way to view your AP Classroom</blockquote>
    <main class="home-main">
      <div @click="router.push({ name: 'assignments' })">
        <h2>Assignments</h2>
        <p>
          Here you can view all of your assignments, from all of your subjects, all in one place.
        </p>
        <RouterLink :to="{ name: 'assignments' }">Let's go!</RouterLink>
      </div>
      <div @click="router.push({ name: 'subjects' })">
        <h2>Subjects</h2>
        <p>
          Here you can view your subjects, their assignments, and the course outline, including the
          Daily Videos.
        </p>
        <RouterLink :to="{ name: 'subjects' }">Let's go!</RouterLink>
      </div>
    </main>
    <p>
      <i>
        You can get around most parts of this website using <b>keyboard shortcuts</b> and
        <b>commands</b>. Type <code>/h</code> to get started!
      </i>
    </p>
  </RestrainCenter>
</template>

<style scoped>
.home-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.home-main > * {
  padding: 1em;
  /* border: 1px solid var(--color-border); */
  cursor: pointer;
}
/* .home-main > *:hover {
  border: 1px solid var(--color-border-hover);
} */
.home-main > :nth-child(1) {
  background-color: #8884;
  border-radius: 1.5em 0 0 1.5em;
}
.home-main > :nth-child(1):hover {
  background-color: #7774;
}
.home-main > :nth-child(2) {
  background-color: #8c84;
  border-radius: 0 1.5em 1.5em 0;
}
.home-main > :nth-child(2):hover {
  background-color: #7b74;
}
.home-main > :nth-child(3) {
  background-color: #fa84;
}
.home-main > :nth-child(4) {
  background-color: #fd54;
}
</style>
