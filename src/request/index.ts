import axios from 'axios'
import router from '@/router'
import { useLocalStore } from '@/stores'
import { login } from '@/service'

const service = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 30000
})

service.interceptors.request.use((config) => {
  if (config.method === undefined) {
    return config
  }
  if (config.method.toLowerCase() === 'get') {
    config.params = config.data
    delete config.data
    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/x-www-form-urlencoded'
  } else {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
  }
  config.headers.token = useLocalStore().token
  return config
})

service.interceptors.response.use(
  (response) => {
    return Promise.resolve(response.data)
  },
  (error) => {
    const status = error?.response?.status
    if (status === undefined) {
      return Promise.reject(null)
    }
    if (status === 404) {
      return Promise.resolve('12345')
    }
    // console.error('Request failed', error, status)
    if (status === 401) {
      const store = useLocalStore()
      if (!store.username || !store.password) {
        router.push({ name: 'login' })
        return Promise.reject(error.response.data)
      }
      if (error.response.config.url === '/auth/login?background') {
        return Promise.reject(error.response.data)
      }
      return login(store.username, store.password, true).then((success) => {
        if (success) {
          return service
            .request(error.response.config)
            .catch(() => Promise.reject(error.response.data))
        }
        return Promise.reject(error.response.data)
      })
      // if (store.token) {
      //   store.token = undefined
      //   alert('Please login again!')
      //   router.push({ name: 'login' })
      // } else {
      //   router.push({ name: 'login' })
      // }
      // return Promise.resolve(error.response.data)
    }
    return Promise.reject(error.response.data)
  }
)

export default service
