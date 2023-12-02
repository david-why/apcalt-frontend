import router from '@/router'
import { getSubjects } from '@/service'
import { type PrioritySuggestion, type SuggestionHandler } from '@/stores'

async function subjectsHandler(text: string): Promise<PrioritySuggestion[]> {
  const subjects = await getSubjects()
  const result = [] as PrioritySuggestion[]
  for (const subject of subjects) {
    if (subject.name.toLowerCase().includes(text.toLowerCase())) {
      result.push({
        html: '<b>Subject</b> ' + subject.name,
        onclick: () => router.push({ name: 'subjectAssignments', params: { id: subject.id } }),
        priority: 50
      })
    }
  }
  return result
}

function assignmentsHandler(text: string): PrioritySuggestion[] {
  if ('all assignments'.includes(text.toLowerCase())) {
    return [
      {
        html: 'All assignments',
        onclick: () => router.push({ name: 'assignments' }),
        priority: 40
      }
    ]
  }
  return []
}

export const defaultHandlers: SuggestionHandler[] = [subjectsHandler, assignmentsHandler]
