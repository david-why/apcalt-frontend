import type { Outline, Subject } from '@/types'
import { commandHandler, defaultCommands } from '@/utils/command'
import { defaultHandlers } from '@/utils/search'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useApcaltStore = defineStore('apcalt', () => {
  const subjects = ref<Subject[]>()
  const outlines = ref({} as Record<string, Outline>)

  return { subjects, outlines }
})

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([] as { id: number; html: string; timeout: number }[])
  const nextId = ref(0)

  function notify(html: string, timeout: number = 5000) {
    const id = nextId.value++
    notifications.value.push({ id, html, timeout })
    setTimeout(() => {
      notifications.value.splice(
        notifications.value.findIndex((v) => v.id === id),
        1
      )
    }, timeout)
  }

  return {
    notifications: computed(() => {
      return notifications.value
    }),
    nextId,
    notify
  }
})

export declare interface Suggestion {
  html: string
  onclick?: () => any
}

export declare interface PrioritySuggestion extends Suggestion {
  priority: number
}

export declare type SuggestionHandler = (
  text: string
) => (Suggestion | PrioritySuggestion)[] | Promise<(Suggestion | PrioritySuggestion)[]>

export declare type CommandRunner = (args: string) => any

export declare interface CommandDefinition {
  name: string
  func: CommandRunner
}

export const useLocalStore = defineStore('local', () => {
  const token = ref(localStorage.getItem('token') || undefined)
  const refreshing = ref(false)
  const username = ref(localStorage.getItem('username') || undefined)
  const password = ref(localStorage.getItem('password') || undefined)
  const loggingIn = ref(false)
  const suggestionHandlers = ref([...defaultHandlers] as SuggestionHandler[])
  const commands = ref([...defaultCommands] as CommandDefinition[])

  const commandsObj = computed(() => {
    const value: Record<string, CommandRunner> = {}
    for (const command of commands.value) {
      value[command.name] = command.func
    }
    return value
  })

  watch(token, (value) => {
    if (value) localStorage.setItem('token', value)
    else localStorage.removeItem('token')
  })

  watch(username, (value) => {
    if (value) localStorage.setItem('username', value)
    else localStorage.removeItem('username')
  })

  watch(password, (value) => {
    if (value) localStorage.setItem('password', value)
    else localStorage.removeItem('password')
  })

  function addSuggestionHandler(handler: SuggestionHandler) {
    if (suggestionHandlers.value.indexOf(handler) === -1) {
      suggestionHandlers.value.push(handler)
    }
  }

  function removeSuggestionHandler(handler: SuggestionHandler) {
    const index = suggestionHandlers.value.indexOf(handler)
    if (index !== -1) {
      suggestionHandlers.value.splice(index, 1)
    }
  }

  async function getSuggestions(text: string) {
    if (text.startsWith('/')) {
      return commandHandler(text)
    }
    const value = [] as PrioritySuggestion[]
    for (const handler of suggestionHandlers.value) {
      const add = await Promise.resolve(handler(text))
      for (const suggestion of add) {
        if ('priority' in suggestion) {
          value.push(suggestion)
        } else {
          value.push({ ...suggestion, priority: 50 })
        }
      }
    }
    return value
  }

  function addCommand(name: string, func: CommandRunner) {
    if (name.length !== 1) {
      throw 'Command names must be one character'
    }
    commands.value.push({ name, func })
  }

  function removeCommand(name: string, func: CommandRunner) {
    let i
    while ((i = commands.value.findIndex((v) => v.name === name && v.func === func)) !== -1) {
      commands.value.splice(i, 1)
    }
  }

  return {
    token,
    refreshing,
    username,
    password,
    loggingIn,
    suggestionHandlers: computed(() => {
      return suggestionHandlers.value
    }),
    commands: commandsObj,
    addSuggestionHandler,
    removeSuggestionHandler,
    getSuggestions,
    addCommand,
    removeCommand
  }
})
