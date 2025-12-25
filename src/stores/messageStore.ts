import { create } from 'zustand'
import type { Message } from '@/types'
import { messagesApi } from '@/services/api'

interface MessageState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  fetchMessages: (params?: { limit?: number; before?: string }) => Promise<void>
  sendMessage: (content: string) => Promise<Message>
  addMessage: (message: Message) => void
  clearError: () => void
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchMessages: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await messagesApi.getAll(params)
      set({ messages: response.data.data, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch messages'
      set({ error: message, isLoading: false })
    }
  },

  sendMessage: async (content: string) => {
    try {
      const response = await messagesApi.send({ content })
      return response.data.data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      set({ error: message })
      throw error
    }
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.some(
        (m) => (m._id || m.id) === (message._id || message.id)
      )
      if (exists) return state
      return { messages: [...state.messages, message] }
    })
  },
}))
