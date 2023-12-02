import router from '@/router'
import { getSubjects } from '@/service'
import { useLocalStore, type CommandDefinition } from '@/stores'

export function executeCommand(text: string) {
  const name = text.substring(1, 2)
  const args = text.substring(2).trim()
  const store = useLocalStore()
  store.commands[name](args)
}

export function commandHandler(text: string) {
  if (!text.startsWith('/') || text.length < 2) {
    return []
  }
  const name = text.substring(1, 2)
  const store = useLocalStore()
  if (name in store.commands) {
    return [
      {
        html:
          '<b>Run command</b> ' +
          text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;'),
        onclick: () => executeCommand(text),
        priority: 10000
      }
    ]
  }
  return []
}

async function subjectCommand(args: string = '') {
  args = args.trim()
  if (args === '') {
    router.push({ name: 'subjects' })
    return
  }
  const subjects = await getSubjects()
  for (const subject of subjects) {
    if (subject.id === args) {
      router.push({ name: 'subjectAssignments', params: { id: subject.id } })
      return
    }
  }
  for (const subject of subjects) {
    if (subject.name.toLowerCase().indexOf(args.toLowerCase()) !== -1) {
      router.push({ name: 'subjectAssignments', params: { id: subject.id } })
      return
    }
  }
}

async function assignmentCommand(args: string = '') {
  args = args.trim()
  if (args === '' || args.charAt(0) === 'a') {
    router.push({ name: 'assignments', query: { status: 'assigned' } })
  }
  if (args.charAt(0) === 'u') {
    router.push({ name: 'assignments', query: { status: 'upcoming' } })
  }
  if (args.charAt(0) === 'c') {
    router.push({ name: 'assignments', query: { status: 'completed' } })
  }
  const [subjectId, assignmentId] = args.split(' ', 2)
  const subjects = await getSubjects()
  for (const subject of subjects) {
    if (subject.id === subjectId) {
      router.push({ name: 'assignment', params: { subjectId, id: assignmentId } })
      return
    }
  }
}

function homeCommand() {
  router.push({ name: 'home' })
}

export const defaultCommands: CommandDefinition[] = [
  { name: 's', func: subjectCommand },
  { name: 'a', func: assignmentCommand },
  { name: 'h', func: homeCommand }
]
