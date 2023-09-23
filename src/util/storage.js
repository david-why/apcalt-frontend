import { defineStore } from 'pinia'
import service from './request'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    token: localStorage.getItem('token'),
    courseOutlines: {},
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
    },
    async getCourseOutline(id) {
      if (!this.hasToken()) {
        return null
      }
      if (this.courseOutlines[id] === undefined) {
        this.courseOutlines[id] = (await service.get('/subjects/' + id + '/courseOutline')).data
      }
      return this.courseOutlines[id]
    },
    getResource(subjectId, resourceId) {
      const courseOutline = this.courseOutlines[subjectId]
      if (courseOutline === undefined) {
        return null
      }
      for (const unit of courseOutline.units) {
        for (const resource of unit.resources) {
          if (resource.resourceId === resourceId) {
            return resource
          }
        }
        for (const subunit of unit.subunits) {
          for (const resource of subunit.resources) {
            if (resource.resourceId === resourceId) {
              return resource
            }
          }
        }
      }
      return null
    }
  }
})
