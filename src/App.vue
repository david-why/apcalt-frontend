<script setup lang="ts">
import MainNavigation from '@/views/MainNavigation.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { getSubjects } from './service'
import { useLocalStore, useNotificationStore } from './stores'
import router from './router';
const notifyStore = useNotificationStore()
const store = useLocalStore()

const nav = ref()

function onKeyDown(event: KeyboardEvent) {
  if (event.target !== document.body) {
    return
  }
  let caught = true
  if (event.key === '/') {
    nav.value.focusSearch()
    nav.value.setSearchValue('/')
  } else if (event.key in store.commands) {
    nav.value.focusSearch()
    nav.value.setSearchValue('/' + event.key)
  } else if (event.key === 'k') {
    nav.value.focusSearch()
  } else if (event.key === 'z') {
    router.back()
  } else {
    caught = false
  }
  if (caught) {
    event.preventDefault()
    event.stopPropagation()
  }
}

onMounted(() => {
  getSubjects()
  document.addEventListener('keydown', onKeyDown, true)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown, true)
})
</script>

<template>
  <MainNavigation class="main-nav" ref="nav"></MainNavigation>
  <div class="main-content"><RouterView :key="$route.fullPath"></RouterView></div>
  <div class="notifications">
    <div
      class="notification"
      v-for="notification in notifyStore.notifications"
      :key="notification.id"
      v-html="notification.html"
    ></div>
  </div>
</template>

<style scoped>
.main-nav {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 3em;
  z-index: 10000;
}
.main-content {
  margin: 0 1em;
}
.notifications {
  position: fixed;
  right: 30px;
  top: 60px;
  width: 300px;
}
.notification {
  padding: 0.5em;
  margin-bottom: 0.5em;
  border: 2px solid green;
  background-color: #dfd;
}
</style>
