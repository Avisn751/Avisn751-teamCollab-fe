import axios from 'axios'
import type {
  ApiResponse,
  AuthResponse,
  Project,
  Task,
  Message,
  Team,
  User,
  AssistantResponse,
} from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { email: string; name: string; firebaseUid: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; firebaseUid: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
  updateProfile: (data: { name: string }) =>
    api.put<ApiResponse<User>>('/auth/profile', data),
}

export const projectsApi = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getOne: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/projects/${id}`),
}

export const tasksApi = {
  getAll: (projectId?: string) =>
    api.get<ApiResponse<Task[]>>('/tasks', { params: { projectId } }),
  getOne: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  create: (data: {
    title: string
    description?: string
    status?: string
    projectId: string
    assignedTo?: string
    priority?: string
  }) => api.post<ApiResponse<Task>>('/tasks', data),
  update: (
    id: string,
    data: {
      title?: string
      description?: string
      status?: string
      assignedTo?: string | null
      priority?: string
    }
  ) => api.put<ApiResponse<Task>>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/tasks/${id}`),
}

export const messagesApi = {
  getAll: (params?: { limit?: number; before?: string }) =>
    api.get<ApiResponse<Message[]>>('/messages', { params }),
  send: (data: { content: string }) =>
    api.post<ApiResponse<Message>>('/messages', data),
}

export const teamApi = {
  get: () => api.get<ApiResponse<Team>>('/team'),
  update: (data: { name?: string; description?: string }) =>
    api.put<ApiResponse<Team>>('/team', data),
  getMembers: () => api.get<ApiResponse<User[]>>('/team/members'),
  addMember: (data: { email: string; name?: string; role?: string }) =>
    api.post<ApiResponse<User>>('/team/members', data),
  updateMember: (memberId: string, data: { role: string }) =>
    api.put<ApiResponse<User>>(`/team/members/${memberId}`, data),
  removeMember: (memberId: string) =>
    api.delete<ApiResponse<void>>(`/team/members/${memberId}`),
}

export const assistantApi = {
  processCommand: (data: { message: string; projectId?: string }) =>
    api.post<ApiResponse<AssistantResponse>>('/assistant/command', data),
}

export default api
