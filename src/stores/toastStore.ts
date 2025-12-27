import { create } from 'zustand'

type ToastType = 'success' | 'error'

interface ToastState {
  message: string | null
  type: ToastType | null
  showToast: (message: string, type?: ToastType) => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: null,
  showToast: (message: string, type: ToastType = 'success') => {
    set({ message, type })
    setTimeout(() => set({ message: null, type: null }), 3000)
  },
  hideToast: () => set({ message: null, type: null }),
}))

export default useToastStore
