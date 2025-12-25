import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/authStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.teamId) return

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected')
      const teamId = typeof user.teamId === 'string' ? user.teamId : user.teamId._id || user.teamId.id
      socket.emit('join-team', teamId)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return () => {
      if (socket.connected) {
        const teamId = typeof user.teamId === 'string' ? user.teamId : user.teamId._id || user.teamId.id
        socket.emit('leave-team', teamId)
      }
      socket.disconnect()
    }
  }, [user?.teamId])

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    socketRef.current?.on(event, callback as (...args: unknown[]) => void)
    return () => {
      socketRef.current?.off(event, callback as (...args: unknown[]) => void)
    }
  }, [])

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback)
    } else {
      socketRef.current?.off(event)
    }
  }, [])

  return { socket: socketRef.current, emit, on, off }
}
