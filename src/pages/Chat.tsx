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
import { Send, MessageSquare, Smile, Loader2 } from 'lucide-react'
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
    <div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex-col animate-in fade-in-0 duration-500">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Team Chat</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Communicate with your team in real-time
            </p>
          </div>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-2 shadow-xl">
        <CardHeader className="border-b py-3 sm:py-4 bg-gradient-to-r from-card to-card/50">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            Team Chat
            {messages.length > 0 && (
              <span className="ml-auto text-xs sm:text-sm text-muted-foreground font-normal">
                {messages.length} messages
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-3 sm:p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center px-4">
                <div className="h-20 w-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">No messages yet</h3>
                <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
                  Start the conversation with your team and collaborate in real-time!
                </p>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {messageGroups.map((group) => (
                  <div key={group.date}>
                    <div className="relative flex items-center py-3 sm:py-4">
                      <div className="flex-grow border-t-2" />
                      <span className="mx-3 sm:mx-4 text-xs sm:text-sm text-muted-foreground font-semibold px-3 py-1 bg-muted/50 rounded-full">
                        {group.date}
                      </span>
                      <div className="flex-grow border-t-2" />
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {group.messages.map((message) => {
                        const isOwnMessage =
                          (message.senderId?._id || message.senderId?.id) ===
                          currentUserId

                        return (
                          <div
                            key={message._id || message.id}
                            className={`flex items-start gap-2 sm:gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                              isOwnMessage ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <Avatar className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 ring-2 ${
                              isOwnMessage 
                                ? 'ring-primary/20' 
                                : 'ring-blue-500/20'
                            }`}>
                              <AvatarFallback className={`text-xs sm:text-sm font-semibold ${
                                isOwnMessage
                                  ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                              }`}>
                                {getInitials(message.senderId?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${
                                isOwnMessage ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`flex items-baseline gap-2 mb-1 ${
                                  isOwnMessage ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <span className="text-xs sm:text-sm font-semibold">
                                  {isOwnMessage
                                    ? 'You'
                                    : message.senderId?.name || 'Unknown'}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {formatMessageTime(message.timestamp)}
                                </span>
                              </div>
                              <div
                                className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-md hover:shadow-lg transition-all duration-200 ${
                                  isOwnMessage
                                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                                    : 'bg-gradient-to-br from-muted to-muted/50 border-2 border-blue-500/10'
                                }`}
                              >
                                <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
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

        <div className="border-t-2 p-3 sm:p-4 bg-gradient-to-r from-card to-card/50">
          {typingUsers.length > 0 && (
            <div className="mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>
                {typingUsers.map((u) => u.userName).join(', ')}{' '}
                {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
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
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              size="lg"
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}