export declare interface Subject {
  id: string
  name: string
}

export declare interface Assignment {
  id: string
  title: string
  resource_id?: string
  status: string
  is_secure: boolean
  opened: string
  starts_at: string
  created_at: string
  due_at?: string
  timer?: number
  display_results: boolean
  type: string
  awaiting_scoring: boolean
  score?: number
  max_score?: number
  filter_status: string
  item?: {
    id: number
    title: string
  }
  progress?: {
    not_started: number
    started: number
    submitted: number
    scoring: number
    mcq_scoring: number
    scored: number
    student_scored: number
    teacher_and_student_scored: number
    complete: number
    ready_to_score: number
  }
}

export declare type SubjectAssignment = Assignment & {
  subject: Subject
}

export declare interface Outline {
  id: string
  educationPeriod: string
  units: OutlineUnit[]
}

export declare interface OutlineUnit {
  unitId: string
  displayName: string
  title: string
  description: string
  number: string
  instructionalPeriods: string
  examWeighting: string
  subunits: OutlineSubunit[]
  resources: OutlineResource[]
}

export declare interface OutlineSubunit {
  subunitId: string
  displayName: string
  number: string
  displayNumber: string
  iconName: string
  resources: OutlineResource[]
}

export declare type OutlineResource = Record<string, any>
