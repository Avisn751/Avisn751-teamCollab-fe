import { useEffect, useRef, useState } from 'react'
import { useMessageStore } from '@/stores/messageStore'
import { useAuthStore } from '@/stores/authStore'
import { useSocket } from '@/hooks/useSocket'
import type { Message } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loading } from '@/components/ui/loading'
import { Send, MessageSquare } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

export default function Chat() {
  const { user } = useAuthStore()
  const { messages, fetchMessages, sendMessage, addMessage, isLoading } =
    useMessageStore()
  const { on, emit } = useSocket()

  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<
    { userId: string; userName: string }[]
  >([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      addMessage(message)
    }

    const handleUserTyping = (data: { userId: string; userName: string }) => {
      const currentUserId = user?._id || user?.id
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev
          return [...prev, data]
        })
      }
    }

    const handleUserStopTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
    }

    const unsub1 = on('message:new', handleNewMessage)
    const unsub2 = on('user-typing', handleUserTyping)
    const unsub3 = on('user-stop-typing', handleUserStopTyping)

    return () => {
      unsub1?.()
      unsub2?.()
      unsub3?.()
    }
  }, [on, addMessage, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    const teamId =
      typeof user?.teamId === 'string'
        ? user.teamId
        : user?.teamId?._id || user?.teamId?.id
    emit('typing', {
      teamId,
      userId: user?._id || user?.id,
      userName: user?.name,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('stop-typing', { teamId, userId: user?._id || user?.id })
    }, 2000)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(newMessage.trim())
      setNewMessage('')
      const teamId =
        typeof user?.teamId === 'string'
          ? user.teamId
          : user?.teamId?._id || user?.teamId?.id
      emit('stop-typing', { teamId, userId: user?._id || user?.id })
    } catch {
      // Error handled in store
    } finally {
      setIsSending(false)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`
    }
    return format(date, 'MMM d, HH:mm')
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []

    messages.forEach((message) => {
      const date = new Date(message.timestamp)
      let dateStr: string

      if (isToday(date)) {
        dateStr = 'Today'
      } else if (isYesterday(date)) {
        dateStr = 'Yesterday'
      } else {
        dateStr = format(date, 'MMMM d, yyyy')
      }

      const existingGroup = groups.find((g) => g.date === dateStr)
      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({ date: dateStr, messages: [message] })
      }
    })

    return groups
  }

  const messageGroups = groupMessagesByDate(messages)
  const currentUserId = user?._id || user?.id

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" text="Loading messages..." />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Team Chat</h2>
        <p className="text-muted-foreground">
          Communicate with your team in real-time
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Team Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No messages yet</h3>
                <p className="text-muted-foreground">
                  Start the conversation with your team
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messageGroups.map((group) => (
                  <div key={group.date}>
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t" />
                      <span className="mx-4 text-xs text-muted-foreground">
                        {group.date}
                      </span>
                      <div className="flex-grow border-t" />
                    </div>

                    <div className="space-y-4">
                      {group.messages.map((message) => {
                        const isOwnMessage =
                          (message.senderId?._id || message.senderId?.id) ===
                          currentUserId

                        return (
                          <div
                            key={message._id || message.id}
                            className={`flex items-start gap-3 ${
                              isOwnMessage ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs">
                                {getInitials(message.senderId?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`max-w-[70%] ${
                                isOwnMessage ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`flex items-baseline gap-2 mb-1 ${
                                  isOwnMessage ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <span className="text-sm font-medium">
                                  {isOwnMessage
                                    ? 'You'
                                    : message.senderId?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(message.timestamp)}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isOwnMessage
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="border-t p-4">
          {typingUsers.length > 0 && (
            <div className="mb-2 text-xs text-muted-foreground animate-pulse">
              {typingUsers.map((u) => u.userName).join(', ')}{' '}
              {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || isSending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
