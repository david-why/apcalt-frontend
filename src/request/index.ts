import axios from 'axios'
import router from '@/router'
import { useLocalStore } from '@/stores'
import { login } from '@/service'

const service = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 30000,
  withCredentials: true
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

function handleError(error: any, status?: number) {
  if (status === undefined) {
    status = error?.response?.status
  }
  if (status === undefined) {
    return Promise.reject(null)
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
  }
  return Promise.reject(error.response.data)
}

service.interceptors.response.use((response) => {
  if (response.data?.code !== undefined && response.data.code !== 200) {
    return handleError({ response }, response.data.code)
  }
  return Promise.resolve(response.data)
}, handleError)

export default service
