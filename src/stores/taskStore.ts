import { create } from 'zustand'
import type { Task, TaskStatus } from '@/types'
import { tasksApi } from '@/services/api'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: (projectId?: string) => Promise<void>
  createTask: (data: {
    title: string
    description?: string
    status?: string
    projectId: string
    assignedTo?: string
    priority?: string
  }) => Promise<Task>
  updateTask: (
    id: string,
    data: {
      title?: string
      description?: string
      status?: string
      assignedTo?: string | null
      priority?: string
    }
  ) => Promise<void>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addTask: (task: Task) => void
  updateTaskInStore: (task: Task) => void
  removeTask: (taskId: string) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTasks: async (projectId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tasksApi.getAll(projectId)
      set({ tasks: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tasks'
      set({ error: message, isLoading: false })
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tasksApi.create(data)
      const newTask = response.data.data
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false,
      }))
      return newTask
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create task'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateTask: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tasksApi.update(id, data)
      const updatedTask = response.data.data
      set((state) => ({
        tasks: state.tasks.map((t) =>
          (t._id || t.id) === id ? updatedTask : t
        ),
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update task'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateTaskStatus: async (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        (t._id || t.id) === id ? { ...t, status } : t
      ),
    }))
    try {
      await tasksApi.update(id, { status })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update task status'
      set({ error: message })
      throw error
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await tasksApi.delete(id)
      set((state) => ({
        tasks: state.tasks.filter((t) => (t._id || t.id) !== id),
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete task'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  addTask: (task) => {
    set((state) => {
      const exists = state.tasks.some((t) => (t._id || t.id) === (task._id || task.id))
      if (exists) return state
      return { tasks: [task, ...state.tasks] }
    })
  },

  updateTaskInStore: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        (t._id || t.id) === (task._id || task.id) ? task : t
      ),
    }))
  },

  removeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => (t._id || t.id) !== taskId),
    }))
  },
}))
