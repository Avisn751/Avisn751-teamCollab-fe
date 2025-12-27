import { create } from 'zustand'
import api from '@/services/api'

interface Notification {
  id: string
  _id?: string
  userId: string
  type: 'task_assigned' | 'task_updated' | 'message' | 'team_invite' | 'project_created' | 'mention'
  title: string
  message: string
  isRead: boolean
  link?: string
  metadata?: {
    taskId?: string
    projectId?: string
    messageId?: string
    senderId?: string
  }
  createdAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  addNotification: (notification: Notification) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/notifications')
      const { notifications, unreadCount } = response.data.data
      set({ notifications, unreadCount, isLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notifications'
      set({ error: message, isLoading: false })
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          (n._id || n.id) === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all')
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },
}))
