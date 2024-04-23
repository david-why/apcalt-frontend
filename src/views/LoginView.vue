<script setup lang="ts">
import CenterContent from '@/components/layout/CenterContent.vue'
import router from '@/router'
import { login } from '@/service'
import { useLocalStore } from '@/stores'
import { ref } from 'vue'
const store = useLocalStore()

const username = ref(store.username || '')
const password = ref(store.password || '')
const waitingText = ref('')

async function onLogin() {
  if (username.value === '' || password.value === '') {
    return
  }
  waitingText.value = 'Logging in, please wait...'
  const success = await login(username.value, password.value)
  if (success) {
    router.push({ name: 'home' })
  } else {
    waitingText.value = 'Login failed!'
  }
}
</script>

<template>
  <CenterContent>
    <h1>Login</h1>
    <blockquote>
      If you are using the standalone version of APCAlt (the app downloaded on your own computer),
      your username/password WILL NOT be sent anywhere except the AP Classroom servers.
      <br />
      However, if you are using the public website, your username and password WILL temporarily be
      sent to the APCAlt servers to log you in. This information is not stored in any way on these
      servers.
    </blockquote>
    <form @submit.prevent="onLogin">
      <table class="login-table">
        <tr>
          <th>Username (email)</th>
          <td><input type="text" v-model="username" size="35" /></td>
        </tr>
        <tr>
          <th>Password</th>
          <td><input type="password" v-model="password" size="35" /></td>
        </tr>
        <tr>
          <td colspan="2"><button class="submit-button">Login!</button></td>
        </tr>
      </table>
    </form>
    <p v-if="waitingText" v-text="waitingText"></p>
  </CenterContent>
</template>

<style scoped>
.login-table {
  margin: auto;
}
.login-table th {
  padding-right: 0.5em;
}
.submit-button {
  padding: 1em 2em;
  border: none;
}
</style>
