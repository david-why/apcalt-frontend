import { reactive } from 'vue'

export const notifications = reactive([])

let notificationId = 1

export function notify(content, timeout) {
  if (timeout === undefined) {
    timeout = 5000
  }
  const id = notificationId++
  notifications.push({ id, content })
  setTimeout(() => {
    for (let i = 0; i < notifications.length; i++) {
      if (notifications[i].id === id) {
        notifications.splice(i, 1)
        break
      }
    }
  }, timeout)
}
