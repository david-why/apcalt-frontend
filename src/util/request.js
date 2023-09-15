import axios from 'axios'
import { router } from '../router'
import { useGlobalStore } from './storage'

const service = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 30000,
  crossDomain: true
})

service.interceptors.request.use((config) => {
  if (config.method.toLowerCase() === 'get') {
    config.params = config.data
    delete config.data
    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/x-www-form-urlencoded'
  } else {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
  }
  config.headers.token = useGlobalStore().token
  return config
})

service.interceptors.response.use(
  (response) => {
    if (response.data?.code === 200) {
      return Promise.resolve(response.data)
    }
    if (response.data?.code === 401) {
      useGlobalStore().logout()
      alert('Please login again!')
      router.push({ path: '/login' })
    }
    console.log(response.data)
    return Promise.reject(response.data)
  },
  (error) => {
    const status = error?.response?.status
    if (status === undefined) {
      return Promise.reject(null)
    }
    return Promise.reject(error)
  }
)

export default service
