import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authApi } from '@/services/api'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logOut,
  onAuthChange,
  type FirebaseUser,
} from '@/config/firebase'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  inviteEmail: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  checkAuth: () => Promise<void>
  initializeAuth: () => () => void
  clearError: () => void
  setInviteEmail: (email: string | null) => void
  changePassword: (currentPassword: string | undefined, newPassword: string) => Promise<void>
  updateProfileImage: (profileImage: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
      inviteEmail: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
        set({ token })
      },
      clearError: () => set({ error: null }),
      setInviteEmail: (email) => set({ inviteEmail: email }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // First try password-only login (for invited users)
          try {
            const response = await authApi.login({ email, password })
            const { user, token } = response.data.data
            get().setToken(token)
            set({ user, isAuthenticated: true, isLoading: false })
            return
          } catch (passwordError: any) {
            // If password login fails with 401, try Firebase
            if (passwordError.response?.status !== 401) {
              throw passwordError
            }
          }

          // Try Firebase login
          const firebaseResult = await signInWithEmail(email, password)
          const response = await authApi.login({
            email,
            firebaseUid: firebaseResult.user.uid,
          })
          const { user, token } = response.data.data
          get().setToken(token)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
          const firebaseResult = await signUpWithEmail(email, password)
          const response = await authApi.register({
            email,
            name,
            firebaseUid: firebaseResult.user.uid,
          })
          const { user, token } = response.data.data
          get().setToken(token)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          const firebaseResult = await signInWithGoogle()
          const response = await authApi.login({
            email: firebaseResult.user.email!,
            firebaseUid: firebaseResult.user.uid,
          })
          const { user, token } = response.data.data
          get().setToken(token)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Google login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await logOut()
        } catch (error) {
          console.error('Firebase logout error:', error)
        }
        get().setToken(null)
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }
        try {
          const response = await authApi.getMe()
          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false,
            token,
          })
        } catch {
          get().setToken(null)
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      initializeAuth: () => {
        const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            const token = localStorage.getItem('token')
            if (token) {
              await get().checkAuth()
            }
          } else {
            set({ isLoading: false })
          }
        })
        return unsubscribe
      },

      changePassword: async (currentPassword: string | undefined, newPassword: string) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.changePassword({ currentPassword, newPassword })
          set({ isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to change password'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      updateProfileImage: async (profileImage: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.updateProfileImage({ profileImage })
          set({ user: response.data.data, isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to update profile image'
          set({ error: message, isLoading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
)
