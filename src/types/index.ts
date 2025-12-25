export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER'

export interface User {
  id: string
  _id?: string
  email: string
  name: string
  role: UserRole
  teamId: Team | string
}

export interface Team {
  id: string
  _id?: string
  name: string
  description?: string
  adminId: User | string
}

export interface Project {
  id: string
  _id?: string
  name: string
  description?: string
  teamId: Team | string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  _id?: string
  title: string
  description?: string
  status: TaskStatus
  projectId: Project | string
  assignedTo: User | null
  priority: TaskPriority
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  _id?: string
  content: string
  senderId: User
  teamId: Team | string
  timestamp: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface AssistantResponse {
  action: string
  response: string
  data: Task | Task[] | Project[] | null
}
