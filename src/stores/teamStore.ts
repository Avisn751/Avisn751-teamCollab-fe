import { create } from 'zustand'
import type { Team, User } from '@/types'
import { teamApi } from '@/services/api'

interface TeamState {
  team: Team | null
  members: User[]
  isLoading: boolean
  error: string | null
  fetchTeam: () => Promise<void>
  updateTeam: (data: { name?: string; description?: string }) => Promise<void>
  fetchMembers: () => Promise<void>
  addMember: (data: { email: string; name?: string; role?: string }) => Promise<void>
  updateMember: (memberId: string, role: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  clearError: () => void
}

export const useTeamStore = create<TeamState>((set) => ({
  team: null,
  members: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTeam: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await teamApi.get()
      set({ team: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch team'
      set({ error: message, isLoading: false })
    }
  },

  updateTeam: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await teamApi.update(data)
      set({ team: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update team'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  fetchMembers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await teamApi.getMembers()
      set({ members: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch members'
      set({ error: message, isLoading: false })
    }
  },

  addMember: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await teamApi.addMember(data)
      const newMember = response.data.data
      set((state) => ({
        members: [...state.members, newMember],
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add member'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateMember: async (memberId: string, role: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await teamApi.updateMember(memberId, { role })
      const updatedMember = response.data.data
      set((state) => ({
        members: state.members.map((m) =>
          (m._id || m.id) === memberId ? updatedMember : m
        ),
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update member'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  removeMember: async (memberId: string) => {
    set({ isLoading: true, error: null })
    try {
      await teamApi.removeMember(memberId)
      set((state) => ({
        members: state.members.filter((m) => (m._id || m.id) !== memberId),
        isLoading: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove member'
      set({ error: message, isLoading: false })
      throw error
    }
  },
}))
