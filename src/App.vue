<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { router } from './router'
import { notifications } from './util/notification'
import { useGlobalStore } from './util/storage'
const store = useGlobalStore()
if (!store.hasToken()) {
  router.push({ path: '/login' })
}
</script>

<script>
export default {
  data() {
    return {
      store: useGlobalStore(),
      command: ''
    }
  },
  computed: {
    hasToken() {
      return this.store.hasToken()
    }
  },
  methods: {
    logout() {
      this.store.logout()
      router.push({ path: '/login' })
    }
  }
}
</script>

<template>
  <!-- <header>
    <input v-model="command" placeholder="Command..." id="CommandInput" />
  </header> -->
  <aside>
    <h2>APCAlt</h2>
    <ul>
      <li><RouterLink to="/">Home</RouterLink></li>
      <li v-if="!hasToken"><RouterLink to="/login">Login</RouterLink></li>
      <li v-if="hasToken"><a href="javascript:;" @click="logout">Logout</a></li>
    </ul>
  </aside>
  <main>
    <RouterView :key="$route.path"></RouterView>
  </main>
  <div class="notifications">
    <div
      class="notification"
      v-for="notification in notifications"
      :key="notification.id"
      v-html="notification.content"
    ></div>
  </div>
</template>

<style scoped>
header {
  grid-area: command-bar;
}
aside {
  grid-area: sidebar;
  font-size: 1em;
}
main {
  grid-area: content;
}
header input {
  text-align: center;
  width: 100%;
  height: 100%;
}
.notifications {
  position: fixed;
  right: 1.5rem;
  top: 1.5rem;
  width: 300px;
}
.notification {
  padding: 0.5em;
  margin-bottom: 0.5em;
  border: 2px solid green;
  background-color: #dfd;
}
</style>
