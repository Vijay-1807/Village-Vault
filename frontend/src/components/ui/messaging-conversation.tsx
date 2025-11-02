"use client"

import { useEffect, useRef } from "react"
import {
  Copy,
  Flag,
  MoreHorizontal,
  Reply,
  Trash2,
  Send,
  Image,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { sanitizeText, validateMessageLength } from "@/utils/sanitize"
import { logger } from "@/utils/logger"
import toast from "react-hot-toast"

type StatusType = "online" | "dnd" | "offline"

const STATUS_COLORS: Record<StatusType, string> = {
  online: "bg-green-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
}

function StatusBadge({ status }: { status: StatusType }) {
  return (
    <span
      aria-label={status}
      className={cn(
        "inline-block size-3 rounded-full border-2 border-background",
        STATUS_COLORS[status]
      )}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  )
}

// Message actions block (for single message, on hover)
function MessageActions({ 
  isMe, 
  onReply, 
  onCopy, 
  onDelete, 
  onReport 
}: { 
  isMe: boolean
  onReply?: () => void
  onCopy?: () => void
  onDelete?: () => void
  onReport?: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Message actions"
          className="size-7 rounded bg-background hover:bg-accent"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal
            aria-hidden="true"
            className="size-3.5"
            focusable="false"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-40 rounded-lg bg-popover p-1 shadow-xl"
      >
        <div className="flex flex-col gap-1">
          {onReply && (
            <Button
              aria-label="Reply"
              className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
              size="sm"
              type="button"
              variant="ghost"
              onClick={onReply}
            >
              <Reply aria-hidden="true" className="size-3" focusable="false" />
              <span>Reply</span>
            </Button>
          )}
          {onCopy && (
            <Button
              aria-label="Copy"
              className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
              size="sm"
              type="button"
              variant="ghost"
              onClick={onCopy}
            >
              <Copy aria-hidden="true" className="size-3" focusable="false" />
              <span>Copy</span>
            </Button>
          )}
          {isMe && onDelete && (
            <Button
              aria-label="Delete"
              className="w-full justify-start gap-2 rounded px-2 py-1 text-destructive text-xs"
              size="sm"
              type="button"
              variant="ghost"
              onClick={onDelete}
            >
              <Trash2 aria-hidden="true" className="size-3" focusable="false" />
              <span>Delete</span>
            </Button>
          )}
          {onReport && (
            <Button
              aria-label="Report"
              className="w-full justify-start gap-2 rounded px-2 py-1 text-xs text-yellow-600"
              size="sm"
              type="button"
              variant="ghost"
              onClick={onReport}
            >
              <Flag aria-hidden="true" className="size-3" focusable="false" />
              <span>Report</span>
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// User actions menu - kept for future use if needed
// Currently removed from UI but can be re-added when functionality is implemented

interface Message {
  id: string
  content?: string
  type: string
  imageUrl?: string
  audioUrl?: string
  createdAt: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId?: string
  receiverName?: string
  receiverRole?: string
}

interface MessagingConversationProps {
  className?: string
  messages: Message[]
  currentUserId: string
  otherUser?: {
    name: string
    avatar?: string
    status?: StatusType
    role?: string
  }
  onSendMessage?: (content: string) => void
  onSendImage?: (file: File) => void
  onClearMessages?: () => void
  onDeleteMessage?: (messageId: string) => void
  formatTime?: (timestamp: string) => string
  sending?: boolean
  newMessage?: string
  setNewMessage?: (message: string) => void
}

export default function MessagingConversation({
  className,
  messages,
  currentUserId,
  otherUser,
  onSendMessage,
  onSendImage,
  onClearMessages,
  onDeleteMessage,
  formatTime,
  sending = false,
  newMessage = "",
  setNewMessage,
}: MessagingConversationProps) {
  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesEndRef.current) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !onSendMessage) return

    // Sanitize and validate message
    const sanitizedMessage = sanitizeText(newMessage.trim())
    
    if (!sanitizedMessage) {
      toast.error('Message cannot be empty')
      return
    }

    if (!validateMessageLength(sanitizedMessage, 5000)) {
      toast.error('Message is too long (max 5000 characters)')
      return
    }

    // Send sanitized message
    onSendMessage(sanitizedMessage)
    if (setNewMessage) setNewMessage("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onSendImage) return
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)')
      e.target.value = ""
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB')
      e.target.value = ""
      return
    }

    onSendImage(file)
    e.target.value = ""
  }

  const handleCopy = async (text: string) => {
    if (!text) return
    
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Message copied to clipboard')
    } catch (error) {
      logger.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy message')
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!onDeleteMessage) return
    
    // Confirm before deleting
    const confirmed = window.confirm('Are you sure you want to delete this message? This action cannot be undone.')
    if (!confirmed) return
    
    onDeleteMessage(messageId)
  }

  const handleReport = async (messageId: string) => {
    logger.log('Report message:', messageId)
    toast('Report functionality coming soon', { icon: 'ℹ️' })
  }

  const formatMessageTime = (timestamp: string): string => {
    if (formatTime) return formatTime(timestamp)
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return "Just now"
      
      const now = new Date()
      const diffInSeconds = (now.getTime() - date.getTime()) / 1000
      const diffInMinutes = diffInSeconds / 60
      const diffInHours = diffInMinutes / 60
      
      if (diffInSeconds < 60) {
        return "Just now"
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`
      } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    } catch {
      return "Just now"
    }
  }

  const getAvatarUrl = (name: string, role: string) => {
    // Use DiceBear API for avatars with initials style
    const seed = `${name}-${role}`.toLowerCase().replace(/\s+/g, "-")
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`
  }

  // Determine if message should be on right side (Sarpanch) or left side (Villager)
  // Sarpanch messages go to the right, Villager messages go to the left
  const isMessageOnRight = (message: Message) => {
    return message.senderRole === 'SARPANCH' || message.senderId === currentUserId
  }

  return (
    <Card
      className={cn(
        "mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden shadow-none bg-white",
        className
      )}
    >
      {/* Header */}
      <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between gap-2 border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3 pt-1">
          <div className="relative">
            <Avatar className="size-10">
              <AvatarImage 
                alt={otherUser?.name || "Village Chat"} 
                src={otherUser?.avatar || getAvatarUrl(otherUser?.name || "Village", "CHAT")} 
              />
              <AvatarFallback>
                {(otherUser?.name || "VC")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-base text-gray-900">
              {otherUser?.name || "Village Group Chat"}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs text-gray-500">
              {otherUser?.status && <StatusBadge status={otherUser.status} />}
              <span>{otherUser?.status || "online"}</span>
              {otherUser?.role && (
                <span className="ml-1">• {otherUser.role}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClearMessages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearMessages}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="min-h-0 flex-1 p-0 bg-gray-50">
        <ScrollArea
          aria-label="Conversation transcript"
          className="flex h-full max-h-full flex-col bg-gray-50 p-4"
          role="log"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-1">No messages yet</p>
                <p className="text-sm text-gray-500">Start a conversation</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              // Sarpanch messages go to the right, Villagers to the left
              const isRightSide = isMessageOnRight(msg)
              
              return (
                <div
                  className={cn(
                    "group my-4 flex gap-2",
                    isRightSide ? "justify-end" : "justify-start"
                  )}
                  key={msg.id}
                >
                  <div
                    className={cn(
                      "flex max-w-[80%] items-start gap-2",
                      isRightSide ? "flex-row-reverse" : undefined
                    )}
                  >
                    <Avatar className="size-8">
                      <AvatarImage
                        alt={msg.senderName}
                        src={getAvatarUrl(msg.senderName, msg.senderRole)}
                      />
                      <AvatarFallback>
                        {msg.senderName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={cn(
                          "rounded-md px-3 py-2 text-sm shadow-sm",
                          isRightSide
                            ? "bg-green-600 text-white" // Sarpanch messages - dark green on right
                            : "bg-gray-200 text-gray-900" // Villager messages - light gray on left
                        )}
                      >
                        {/* Sender name for group chat (only show for left side messages) */}
                        {!isRightSide && (
                          <div className="text-xs font-semibold mb-1 text-gray-700">
                            {msg.senderName}
                            {msg.senderRole === 'SARPANCH' && (
                              <span className="ml-1 text-xs opacity-75">(Sarpanch)</span>
                            )}
                          </div>
                        )}
                        
                        {/* Message content */}
                        {msg.type === 'TEXT' && (
                          <p className="break-words">{msg.content}</p>
                        )}
                        {msg.type === 'IMAGE' && msg.imageUrl && (
                          <div>
                            <img
                              src={msg.imageUrl}
                              alt="Shared image"
                              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity mt-2"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                      <div className={cn("mt-1 flex items-center gap-2", isRightSide ? "flex-row-reverse" : "")}>
                        <time
                          aria-label={`Sent at ${formatMessageTime(msg.createdAt)}`}
                          className="text-muted-foreground text-xs text-gray-500"
                          dateTime={msg.createdAt}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </time>
                        <div className="opacity-0 transition-all group-hover:opacity-100">
                          <MessageActions
                            isMe={isRightSide}
                            onCopy={() => msg.content && handleCopy(msg.content)}
                            onDelete={() => handleDelete(msg.id)}
                            onReport={() => handleReport(msg.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              const value = e.target.value
              // Limit input length client-side
              if (value.length <= 5000) {
                setNewMessage && setNewMessage(value)
              }
            }}
            placeholder="Type a message... (max 5000 characters)"
            maxLength={5000}
            className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 disabled:opacity-50"
            disabled={sending}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center"
            title="Upload image"
          >
            <Image className="h-5 w-5 text-gray-700" />
          </label>
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}

