import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import { AlertTriangle, Clock, UserCheck, Bell, PhoneCall, Mail, RefreshCw } from 'lucide-react'
import { logger } from '../utils/logger'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUsers: number
  totalVillagers: number
  totalAlerts: number
  pendingSOSReports: number
  recentMessages: number
}

interface RecentAlert {
  id: string
  title: string
  message: string
  priority: string
  createdAt: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { socket, isConnected } = useSocket()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (socket && isConnected) {
      // Listen for dashboard stats updates
      socket.on('dashboardStatsUpdate', (newStats: DashboardStats) => {
        setStats(newStats)
      })

      // Listen for new alerts to update the recent alerts list
      socket.on('newAlert', (newAlert: any) => {
        setRecentAlerts(prev => {
          const updated = [newAlert, ...prev].slice(0, 5) // Keep only recent 5
          return updated
        })
        // Also refresh stats when new alert comes in
        fetchDashboardData()
      })

      // Listen for SOS updates to refresh stats
      socket.on('sosAlert', () => {
        fetchDashboardData()
      })

      socket.on('sosStatusUpdate', () => {
        fetchDashboardData()
      })

      return () => {
        socket.off('dashboardStatsUpdate')
        socket.off('newAlert')
        socket.off('sosAlert')
        socket.off('sosStatusUpdate')
      }
    }
  }, [socket, isConnected])

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true)
    }

    try {
      const [statsResponse, alertsResponse] = await Promise.all([
        api.get('/users/village/stats'),
        api.get('/alerts?limit=5')
      ])

      // Only set stats if response is successful and has data
      if (statsResponse.data.success && statsResponse.data.data?.stats) {
        setStats(statsResponse.data.data.stats)
      } else {
        // Set zero stats if API returns invalid data
        setStats({
          totalUsers: 0,
          totalVillagers: 0,
          totalAlerts: 0,
          pendingSOSReports: 0,
          recentMessages: 0
        })
      }

      // Only set alerts if response is successful and has data
      if (alertsResponse.data.success && alertsResponse.data.data?.alerts) {
        setRecentAlerts(alertsResponse.data.data.alerts)
      } else {
        setRecentAlerts([])
      }
    } catch (error) {
      logger.error('Failed to fetch dashboard data:', error)
      // Set zero stats instead of false data
      setStats({
        totalUsers: 0,
        totalVillagers: 0,
        totalAlerts: 0,
        pendingSOSReports: 0,
        recentMessages: 0
      })
      setRecentAlerts([])

      // Show error toast only on manual refresh
      if (isManualRefresh) {
        toast.error('Failed to refresh dashboard data. Please try again.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return 'text-red-600 bg-red-100'
      case 'HIGH':
        return 'text-orange-600 bg-orange-100'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100'
      case 'LOW':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return t('alerts.priority.emergency')
      case 'HIGH':
        return t('alerts.priority.high')
      case 'MEDIUM':
        return t('alerts.priority.medium')
      case 'LOW':
        return t('alerts.priority.low')
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto space-y-6 p-4 sm:p-6 md:p-8">
      {/* Welcome Section */}
      <div className="village-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 break-words mb-2">
              {t('dashboard.welcome')}, {user?.name}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
              {user?.role === 'SARPANCH' ? 'Manage your village communications' : 'Stay connected with your village'}
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="village-user-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('dashboard.totalUsers')}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="village-alert-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('dashboard.totalAlerts')}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAlerts}</p>
              </div>
            </div>
          </div>

          <div className="village-emergency-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <PhoneCall className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('dashboard.pendingSOS')}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingSOSReports}</p>
              </div>
            </div>
          </div>

          <div className="village-message-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('dashboard.recentMessages')}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recentMessages}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="village-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">{t('dashboard.recentAlerts')}</h2>
          <a href="/alerts" className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
            View All →
          </a>
        </div>
        <div>
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 break-words">
                        {alert.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto ${getPriorityColor(alert.priority)}`}>
                        {getPriorityText(alert.priority)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 break-words">
                      {alert.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.role === 'SARPANCH' ? 'Create your first alert to get started.' : 'You will see alerts here when they are sent.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="village-card">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {user?.role === 'SARPANCH' && (
            <a
              href="/alerts"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-900">Create Alert</span>
            </a>
          )}
          <a
            href="/messages"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-900">Send Message</span>
          </a>
          <a
            href="/sos"
            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <PhoneCall className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-900">Report Emergency</span>
          </a>
        </div>
      </div>

    </div>
  )
}

export default Dashboard
