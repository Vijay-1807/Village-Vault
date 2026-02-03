import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSocket } from '../contexts/SocketContext'
import { api } from '../services/api'
import alertService from '../services/alertService'
import MessagingConversation from '../components/ui/messaging-conversation'
import { logger } from '../utils/logger'
import { sanitizeText } from '../utils/sanitize'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content?: string
  type: string
  audioUrl?: string
  imageUrl?: string
  isRead: boolean
  createdAt: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId?: string
  receiverName?: string
  receiverRole?: string
}

const Messages = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastSendTime, setLastSendTime] = useState(0)
  const RATE_LIMIT_MS = 1000 // 1 second between messages

  useEffect(() => {
    fetchMessages()
  }, [])

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      // Listen for new messages
      socket.on('newMessage', (message: Message) => {
        logger.log('New message received:', message)
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(msg => msg.id === message.id)
          if (exists) return prev
          return [...prev, message]
        })
      })

      // Listen for message updates
      socket.on('messageUpdated', (updatedMessage: Message) => {
        logger.log('Message updated:', updatedMessage)
        setMessages(prev =>
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        )
      })

      // Listen for message deletion
      socket.on('messageDeleted', (messageId: string) => {
        logger.log('Message deleted:', messageId)
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      })

      return () => {
        socket.off('newMessage')
        socket.off('messageUpdated')
        socket.off('messageDeleted')
      }
    }
  }, [socket, isConnected])

  const fetchMessages = async () => {
    try {
      logger.log('Fetching messages...')
      const response = await api.get('/messages')
      logger.log('Messages response received')

      const messagesData = response.data.data.messages || []

      // Ensure each message has the required fields with fallbacks
      const normalizedMessages = messagesData.map((message: any) => ({
        ...message,
        senderId: message.senderId || '',
        senderName: message.senderName || 'Unknown',
        senderRole: message.senderRole || 'USER',
        receiverId: message.receiverId || '',
        receiverName: message.receiverName || '',
        receiverRole: message.receiverRole || ''
      }))

      setMessages(normalizedMessages)
    } catch (error) {
      logger.error('Failed to fetch messages:', error)
      toast.error('Failed to fetch messages. Please try again.')
      setMessages([]) // Set empty array on error
    } finally {
      setLoading(false) // Always set loading to false
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Rate limiting: prevent sending messages too quickly
    const now = Date.now()
    const timeSinceLastSend = now - lastSendTime

    if (timeSinceLastSend < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastSend
      toast.error(`Please wait ${Math.ceil(waitTime / 1000)} second(s) before sending another message`)
      return
    }

    // Sanitize content (already done in component, but double-check)
    const sanitizedContent = sanitizeText(content.trim())
    if (!sanitizedContent) {
      toast.error('Message cannot be empty')
      return
    }

    // Optimistic update: add message immediately with temporary ID
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content: sanitizedContent,
      type: 'TEXT',
      isRead: false,
      createdAt: new Date().toISOString(),
      senderId: user?.id || '',
      senderName: user?.name || 'You',
      senderRole: user?.role || 'VILLAGER',
      receiverId: '',
      receiverName: '',
      receiverRole: ''
    }

    // Add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage])
    setLastSendTime(now)
    setSending(true)

    try {
      logger.log('Sending text message')
      const response = await api.post('/messages', {
        content: sanitizedContent,
        type: 'TEXT',
        villageId: user?.villageId || 'test-village-id'
      })

      // Replace optimistic message with real message from server
      const realMessage = response.data.data.message
      setMessages(prev =>
        prev.map(msg => msg.id === tempId ? realMessage : msg)
      )

      // Emit message via Socket.IO for real-time updates
      if (socket && isConnected) {
        socket.emit('sendMessage', realMessage)
      }

      toast.success('Message sent successfully')
    } catch (error: any) {
      logger.error('Text message error:', error)

      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))

      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSendImage = async (file: File) => {
    if (!file) return

    logger.log('Image upload started:', file.name, file.type, file.size)

    // Rate limiting check
    const now = Date.now()
    const timeSinceLastSend = now - lastSendTime

    if (timeSinceLastSend < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastSend
      toast.error(`Please wait ${Math.ceil(waitTime / 1000)} second(s) before sending another message`)
      return
    }

    // Validate file type (already done in component, but double-check)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Optimistic update: add loading message
    const tempId = `temp-image-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content: 'Uploading image...',
      type: 'IMAGE',
      imageUrl: URL.createObjectURL(file), // Temporary preview
      isRead: false,
      createdAt: new Date().toISOString(),
      senderId: user?.id || '',
      senderName: user?.name || 'You',
      senderRole: user?.role || 'VILLAGER',
      receiverId: '',
      receiverName: '',
      receiverRole: ''
    }

    setMessages(prev => [...prev, optimisticMessage])
    setLastSendTime(now)
    setSending(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'IMAGE')
      formData.append('villageId', user?.villageId || 'test-village-id')

      logger.log('Sending image upload request...')
      const response = await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Replace optimistic message with real message from server
      const realMessage = response.data.data.message

      // Clean up temporary object URL
      if (optimisticMessage.imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(optimisticMessage.imageUrl)
      }

      setMessages(prev =>
        prev.map(msg => msg.id === tempId ? realMessage : msg)
      )

      // Emit message via Socket.IO for real-time updates
      if (socket && isConnected) {
        socket.emit('sendMessage', realMessage)
      }

      toast.success('Image shared successfully!')
    } catch (error: any) {
      logger.error('Image upload error:', error)

      // Remove optimistic message on error
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== tempId)
        // Clean up blob URL
        if (optimisticMessage.imageUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(optimisticMessage.imageUrl)
        }
        return updated
      })

      toast.error(error.response?.data?.message || 'Failed to share image. Please try again.')
    } finally {
      setSending(false)
    }
  }


  const clearAllMessages = async () => {
    const result = await alertService.confirm(
      'Are you sure you want to clear all messages? This action cannot be undone.',
      'Clear All Messages'
    )

    if (result.isConfirmed) {
      try {
        await api.delete('/messages/clear')
        setMessages([])
        alertService.success('All messages cleared!')
      } catch (error: any) {
        alertService.error(error.response?.data?.message || 'Failed to clear messages')
      }
    }
  }

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`)
      setMessages(prev => prev.filter(msg => msg.id !== messageId))

      // Emit deletion via Socket.IO
      if (socket && isConnected) {
        socket.emit('deleteMessage', messageId)
      }

      toast.success('Message deleted successfully')
    } catch (error: any) {
      logger.error('Failed to delete message:', error)
      toast.error(error.response?.data?.message || 'Failed to delete message')
    }
  }

  const formatTime = (timestamp: string | Date | any) => {
    try {
      let date: Date

      // Handle different timestamp formats
      if (typeof timestamp === 'object' && timestamp !== null) {
        // Handle Firestore timestamp object
        if (timestamp._seconds !== undefined) {
          date = new Date(timestamp._seconds * 1000)
        } else if (timestamp.seconds !== undefined) {
          date = new Date(timestamp.seconds * 1000)
        } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate()
        } else if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
          date = new Date(timestamp.toMillis())
        } else {
          logger.warn('Unknown timestamp object format:', timestamp)
          return 'Just now'
        }
      } else if (typeof timestamp === 'string') {
        // Handle string timestamps
        if (timestamp.includes('_seconds') || timestamp.includes('_nanoseconds')) {
          try {
            const timestampObj = JSON.parse(timestamp)
            if (timestampObj._seconds !== undefined) {
              date = new Date(timestampObj._seconds * 1000)
            } else if (timestampObj.seconds !== undefined) {
              date = new Date(timestampObj.seconds * 1000)
            } else {
              date = new Date(timestamp)
            }
          } catch {
            date = new Date(timestamp)
          }
        } else {
          date = new Date(timestamp)
        }
      } else if (timestamp instanceof Date) {
        date = timestamp
      } else if (typeof timestamp === 'number') {
        // Handle Unix timestamp (seconds or milliseconds)
        date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000)
      } else {
        logger.warn('Unknown timestamp type:', typeof timestamp)
        return 'Just now'
      }

      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        logger.warn('Invalid date created from timestamp:', timestamp)
        return 'Just now'
      }

      const now = new Date()
      const diffInSeconds = (now.getTime() - date.getTime()) / 1000
      const diffInMinutes = diffInSeconds / 60
      const diffInHours = diffInMinutes / 60

      if (diffInSeconds < 60) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    } catch (error) {
      logger.error('Date formatting error:', error)
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="spinner"></div>
      </div>
    )
  }

  // Determine other user info for group chat
  const otherUser = {
    name: t('messages.groupChat'),
    status: 'online' as const,
    role: 'Group Chat',
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <MessagingConversation
        messages={messages}
        currentUserId={user?.id || ''}
        otherUser={otherUser}
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        onClearMessages={user?.role === 'SARPANCH' ? clearAllMessages : undefined}
        onDeleteMessage={handleDeleteMessage}
        formatTime={formatTime}
        sending={sending}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        className="h-full"
      />
    </div>
  )
}

export default Messages