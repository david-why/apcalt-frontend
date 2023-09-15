<script setup>
import service from '../util/request'
import { useGlobalStore } from '../util/storage'
import { router } from '../router'
</script>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      store: useGlobalStore(),
      loginMessage: ''
    }
  },
  methods: {
    async submitForm() {
      const username = this.username
      const password = this.password
      this.loginMessage = 'Logging in, please wait...'
      try {
        const response = await service.post('/auth/login', { username, password })
        this.store.setToken(response.data)
        router.push({ path: '/' })
      } catch (error) {
        console.error('an error occurred lol', error)
        this.loginMessage = 'Login failed!'
      }
    }
  }
}
</script>

<template>
  <h1>Login</h1>
  <p>Login with your credentials!</p>
  <table>
    <tr>
      <td>Username</td>
      <td><input v-model="username" /></td>
    </tr>
    <tr>
      <td>Password</td>
      <td><input type="password" v-model="password" /></td>
    </tr>
  </table>
  <button @click="submitForm">Login</button>
  <p v-text="loginMessage"></p>
</template>
