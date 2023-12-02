import service from '@/request'
import { useApcaltStore, useLocalStore } from '@/stores'
import type { Assignment, Outline, Subject, SubjectAssignment } from '@/types'

function awaitLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const store = useLocalStore()
    if (!store.loggingIn) {
      if (store.token) {
        resolve(store.token)
      } else {
        reject('Login failed')
      }
    }
    const stop = store.$subscribe(() => {
      if (!store.loggingIn) {
        stop()
        if (store.token) {
          resolve(store.token)
        } else {
          reject('Login failed')
        }
      }
    })
  })
}

export async function login(
  username: string,
  password: string,
  isBackground: boolean = false
): Promise<boolean> {
  const store = useLocalStore()
  if (store.loggingIn) {
    try {
      await awaitLogin()
      return true
    } catch (e) {
      console.error('Error awaiting login', e)
      return false
    }
  }
  store.loggingIn = true
  store.token = undefined
  const url = isBackground ? '/auth/login' : '/auth/login?background'
  try {
    const response = await service.post(url, { username, password })
    store.token = response.data
    store.username = username
    store.password = password
    store.loggingIn = false
    return true
  } catch (e) {
    console.error('Error logging in', e)
    store.loggingIn = false
    return false
  }
}

export async function logout(): Promise<void> {
  try {
    await service.post('/auth/logout')
  } catch (e) {
    console.error('Error logging out', e)
  }
  useLocalStore().token = undefined
}

export async function getSubjects(): Promise<Subject[]> {
  const store = useApcaltStore()
  if (store.subjects !== undefined) {
    return store.subjects
  }
  try {
    return (store.subjects = (await service.get('/subjects')).data)
  } catch (e) {
    console.error('Error getting subjects', e)
    return []
  }
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  const subjects = await getSubjects()
  for (const subject of subjects) {
    if (subject.id === id) {
      return subject
    }
  }
}

export async function getOutline(id: string): Promise<Outline | undefined> {
  const store = useApcaltStore()
  if (store.outlines[id] !== undefined) {
    return store.outlines[id]
  }
  return (store.outlines[id] =
    (await service.get(`/subjects/${id}/courseOutline`)).data || undefined)
}

export async function getSignedUrl(url: string): Promise<string> {
  const parsed = new URL(url)
  const bucket = parsed.hostname.split(/\./, 2)[0]
  const key = parsed.pathname
  return (await service.post('/media/signedUrl', { bucket, key })).data
}

export async function getAssignments(
  subject: Subject | string,
  status: string = 'assigned'
): Promise<SubjectAssignment[]> {
  if (typeof subject !== 'string') {
    subject = subject.id
  }
  const subjectData = await getSubject(subject)
  return (await service.get(`/subjects/${subject}/assignments?status=${status}`)).data.map(
    (a: Assignment) => ({
      ...a,
      subject: subjectData
    })
  )
}

export async function getAllAssignments({
  callback,
  status = 'assigned'
}: { callback?: (subject: Subject) => any; status?: string } = {}): Promise<SubjectAssignment[]> {
  const subjects = await getSubjects()
  const result: SubjectAssignment[] = []
  for (const subject of subjects) {
    if (callback) {
      callback(subject)
    }
    const assignments = await getAssignments(subject, status)
    assignments.forEach((v) => result.push({ ...v, subject }))
  }
  return result
}

export async function startAssignment(subjectId: string, id: string) {
  await service.post(`/subjects/${subjectId}/assignments/${id}/start`)
}

export async function getAssignment(subjectId: string, id: string, review: boolean = false) {
  return (await service.get(`/subjects/${subjectId}/assignments/${id}${review ? '/review' : ''}`))
    .data
}

export async function getReport(subjectId: string, id: string) {
  return (await service.get(`/subjects/${subjectId}/assignments/${id}/review/report`)).data
}

export async function getAnswers(subjectId: string, id: string) {
  return (await service.get(`/subjects/${subjectId}/assignments/${id}/review/answers`)).data
}

export async function getResponses(subjectId: string, id: string, review: boolean = false) {
  return (
    await service.get(
      `/subjects/${subjectId}/assignments/${id}${review ? '/review' : ''}/responses`
    )
  ).data
}

export async function getTimed(subjectId: string, id: string) {
  return (await service.get(`/subjects/${subjectId}/assignments/${id}/timed`)).data
}

export async function setResponses(subjectId: string, id: string, responses: Record<string, any>) {
  const data = [] as { id: string; response: any }[]
  for (const responseId in responses) {
    data.push({ id: responseId, response: responses[responseId] })
  }
  await service.put(`/subjects/${subjectId}/assignments/${id}/responses`, data)
}

export async function submit(subjectId: string, id: string) {
  await service.post(`/subjects/${subjectId}/assignments/${id}/submit`)
}
