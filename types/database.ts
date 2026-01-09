export interface Task {
  id: string
  title: string
  description: string | null
  pomodoros_estimated: number
  pomodoros_actual: number
  is_completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  task_id: string
  content: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}
