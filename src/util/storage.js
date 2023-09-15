import { defineStore } from 'pinia'
import service from './request'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    token: localStorage.getItem('token'),
    me: null,
    subjects: null
  }),
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    logout() {
      this.token = null
      this.me = null
      this.subjects = null
      localStorage.removeItem('token')
    },
    hasToken() {
      return this.token !== null
    },
    async getMe() {
      if (!this.hasToken()) {
        return null
      }
      if (this.me === null) {
        this.me = (await service.get('/me')).data
      }
      return this.me
    },
    async getSubjects() {
      if (!this.hasToken()) {
        return null
      }
      if (this.subjects === null) {
        this.subjects = (await service.get('/subjects')).data
      }
      return this.subjects
    }
  }
})
