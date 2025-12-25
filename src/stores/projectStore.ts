import { create } from 'zustand'
import type { Project } from '@/types'
import { projectsApi } from '@/services/api'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (data: { name: string; description?: string }) => Promise<Project>
  updateProject: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  clearError: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  setCurrentProject: (project) => set({ currentProject: project }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectsApi.getAll()
      set({ projects: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch projects'
      set({ error: message, isLoading: false })
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectsApi.getOne(id)
      set({ currentProject: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch project'
      set({ error: message, isLoading: false })
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectsApi.create(data)
      const newProject = response.data.data
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }))
      return newProject
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create project'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectsApi.update(id, data)
      const updatedProject = response.data.data
      set((state) => ({
        projects: state.projects.map((p) =>
          (p._id || p.id) === id ? updatedProject : p
        ),
        currentProject:
          (state.currentProject?._id || state.currentProject?.id) === id
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update project'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await projectsApi.delete(id)
      set((state) => ({
        projects: state.projects.filter((p) => (p._id || p.id) !== id),
        currentProject:
          (state.currentProject?._id || state.currentProject?.id) === id
            ? null
            : state.currentProject,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete project'
      set({ error: message, isLoading: false })
      throw error
    }
  },
}))
