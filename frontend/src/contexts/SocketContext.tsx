import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import alertService from '../services/alertService'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        setIsConnected(true)
        newSocket.emit('joinVillage')
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        setIsConnected(false)
      })

      // Listen for new alerts
      newSocket.on('newAlert', (alert) => {
        alertService.success(`New Alert: ${alert.title}`, 'New Alert Received')
      })

      // Listen for SOS alerts (for sarpanch)
      newSocket.on('sosAlert', (sosReport) => {
        alertService.error(`SOS Alert: ${sosReport.description || 'Emergency reported'}`, 'Emergency SOS Alert')
      })

      // Listen for new messages
      newSocket.on('newMessage', (message) => {
        const senderName = message.senderName || message.sender?.name || 'Unknown'
        alertService.info(`New message from ${senderName}`, 'New Message')
      })

      // Listen for SOS status updates
      newSocket.on('sosStatusUpdate', (update) => {
        alertService.success(`SOS Report Status: ${update.status}`, 'SOS Status Updated')
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user, token])

  const value: SocketContextType = {
    socket,
    isConnected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
