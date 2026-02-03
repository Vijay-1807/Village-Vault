import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Bell, Trash2 } from 'lucide-react'
import alertService from '../services/alertService'

interface Alert {
  id: string
  title: string
  message: string
  priority: string
  channels: string[]
  isScheduled: boolean
  scheduledAt?: string
  isRepeated: boolean
  repeatInterval?: string
  createdAt: string
  senderId: string
  senderName: string
  senderRole: string
  deliveries: Array<{
    channel: string
    status: string
    sentAt?: string
    deliveredAt?: string
  }>
}

const Alerts = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM',
    channels: ['IN_APP'],
    isScheduled: false,
    scheduledAt: '',
    isRepeated: false,
    repeatInterval: 'daily'
  })

  const { socket, isConnected } = useSocket()

  useEffect(() => {
    fetchAlerts()
  }, [])

  // Real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('newAlert', (newAlert) => {
        setAlerts(prev => [newAlert, ...prev])
      })

      // Assuming backend emits these events - if not, only manual refresh works, but good to have
      socket.on('alertDeleted', (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      })

      socket.on('alertUpdated', (updatedAlert) => {
        setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a))
      })

      return () => {
        socket.off('newAlert')
        socket.off('alertDeleted')
        socket.off('alertUpdated')
      }
    }
  }, [socket, isConnected])

  const handleDeleteAlert = async (id: string) => {
    if (!window.confirm(t('Are you sure you want to delete this alert?'))) return
    try {
      await api.delete(`/alerts/${id}`)
      alertService.success('Alert deleted successfully')
      setAlerts(prev => prev.filter(a => a.id !== id))
    } catch (error: any) {
      alertService.error(error.response?.data?.message || 'Failed to delete alert')
    }
  }

  // Assuming complete means marking as resolved or similar status change if backend supports it


  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'Unknown Date';

    let date: Date;

    // Handle Firestore Timestamp
    if (dateInput?.seconds) {
      date = new Date(dateInput.seconds * 1000);
    } else if (dateInput?._seconds) {
      date = new Date(dateInput._seconds * 1000);
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts')
      const alertsData = response.data.data.alerts || []
      // Ensure each alert has the required fields with fallbacks
      const normalizedAlerts = alertsData.map((alert: any) => ({
        ...alert,
        senderName: alert.senderName || 'Unknown',
        senderRole: alert.senderRole || 'USER',
        senderId: alert.senderId || '',
        deliveries: alert.deliveries || []
      }))
      setAlerts(normalizedAlerts)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      alertService.error('Failed to fetch alerts')
      setAlerts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlert.title.trim() || !newAlert.message.trim()) return

    setCreateLoading(true)
    try {
      const alertData: any = {
        title: newAlert.title.trim(),
        message: newAlert.message.trim(),
        priority: newAlert.priority,
        villageId: user?.villageId || 'test-village-id',
        channels: newAlert.channels || ['IN_APP'],
        isScheduled: newAlert.isScheduled || false,
        scheduledAt: newAlert.isScheduled && newAlert.scheduledAt ? newAlert.scheduledAt : undefined,
        isRepeated: newAlert.isRepeated || false,
        repeatInterval: newAlert.repeatInterval || 'daily'
      }

      // Remove undefined values
      Object.keys(alertData).forEach(key => {
        if (alertData[key] === undefined) {
          delete alertData[key]
        }
      })

      console.log('Sending alert data:', alertData)
      await api.post('/alerts', alertData)
      alertService.success('Alert created successfully')
      setShowCreateForm(false)
      setNewAlert({
        title: '',
        message: '',
        priority: 'MEDIUM',
        channels: ['IN_APP'],
        isScheduled: false,
        scheduledAt: '',
        isRepeated: false,
        repeatInterval: 'daily'
      })
      fetchAlerts()
    } catch (error: any) {
      alertService.error(error.response?.data?.message || 'Failed to create alert')
    } finally {
      setCreateLoading(false)
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

  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'IN_APP':
        return t('alerts.channels.inApp')
      case 'SMS':
        return t('alerts.channels.sms')
      case 'MISSED_CALL':
        return t('alerts.channels.missedCall')
      default:
        return channel
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
    <div className="h-full overflow-y-auto space-y-6 sm:space-y-8 animate-fadeInUp p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 break-words">
              {t('alerts.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
              Manage and create village alerts
            </p>
          </div>
        </div>
        {user?.role === 'SARPANCH' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('alerts.create')}
          </button>
        )}
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="village-card animate-slideInRight">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 mb-6">Create New Alert</h2>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('alerts.title')}
              </label>
              <input
                type="text"
                required
                className="input-field bg-white border-2 border-orange-100 focus:border-orange-500 focus:ring-orange-200"
                value={newAlert.title}
                onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter alert title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('alerts.message')}
              </label>
              <textarea
                required
                rows={3}
                className="input-field bg-white border-2 border-orange-100 focus:border-orange-500 focus:ring-orange-200"
                value={newAlert.message}
                onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter alert message"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alerts.priority')}
                </label>
                <select
                  className="input-field bg-white border-2 border-orange-100 focus:border-orange-500 focus:ring-orange-200"
                  value={newAlert.priority}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="LOW">{t('alerts.priority.low')}</option>
                  <option value="MEDIUM">{t('alerts.priority.medium')}</option>
                  <option value="HIGH">{t('alerts.priority.high')}</option>
                  <option value="EMERGENCY">{t('alerts.priority.emergency')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alerts.channels')}
                </label>
                <div className="space-y-2 bg-orange-50 p-3 rounded-xl border border-orange-100">
                  {['IN_APP', 'SMS', 'MISSED_CALL'].map((channel) => (
                    <label key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newAlert.channels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAlert(prev => ({
                              ...prev,
                              channels: [...prev.channels, channel]
                            }))
                          } else {
                            setNewAlert(prev => ({
                              ...prev,
                              channels: prev.channels.filter(c => c !== channel)
                            }))
                          }
                        }}
                        className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium">{getChannelText(channel)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAlert.isScheduled}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, isScheduled: e.target.checked }))}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 font-medium">{t('alerts.scheduled')}</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAlert.isRepeated}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, isRepeated: e.target.checked }))}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 font-medium">{t('alerts.repeated')}</span>
              </label>
            </div>

            {newAlert.isScheduled && (
              <div className="animate-fadeInUp">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alerts.scheduledAt')}
                </label>
                <input
                  type="datetime-local"
                  className="input-field bg-white border-2 border-orange-100 focus:border-orange-500"
                  value={newAlert.scheduledAt}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
            )}

            {newAlert.isRepeated && (
              <div className="animate-fadeInUp">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alerts.repeatInterval')}
                </label>
                <select
                  className="input-field bg-white border-2 border-orange-100 focus:border-orange-500"
                  value={newAlert.repeatInterval}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, repeatInterval: e.target.value }))}
                >
                  <option value="daily">{t('alerts.repeatInterval.daily')}</option>
                  <option value="weekly">{t('alerts.repeatInterval.weekly')}</option>
                  <option value="monthly">{t('alerts.repeatInterval.monthly')}</option>
                </select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary w-full sm:w-auto"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {createLoading ? <div className="spinner"></div> : t('common.send')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      <div className="village-card">
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 sm:p-6 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-300 ${alert.priority === 'EMERGENCY' ? 'bg-red-50 border-red-500' :
                alert.priority === 'HIGH' ? 'bg-orange-50 border-orange-500' :
                  alert.priority === 'MEDIUM' ? 'bg-amber-50 border-amber-500' :
                    'bg-blue-50 border-blue-500'
                }`}>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${alert.priority === 'EMERGENCY' ? 'bg-red-100 text-red-600' :
                          alert.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                            alert.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 break-words">{alert.title}</h3>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto uppercase tracking-wide shadow-sm ${getPriorityColor(alert.priority)}`}>
                        {getPriorityText(alert.priority)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 break-words">{alert.message}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>By: {alert.senderName || 'Unknown'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(alert.createdAt)}</span>
                      {alert.isScheduled && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {user?.role === 'SARPANCH' && (
                    <div className="flex flex-col sm:flex-row gap-2">

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Delivery Status */}
                {alert.deliveries && alert.deliveries.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Status:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alert.deliveries.map((delivery, index) => (
                        <div key={index} className="flex items-center space-x-2 px-2 sm:px-3 py-1 bg-gray-100 rounded-full">
                          <Bell className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 whitespace-nowrap">{getChannelText(delivery.channel)}</span>
                          {getStatusIcon(delivery.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'SARPANCH' ? 'Create your first alert to get started.' : 'You will see alerts here when they are sent.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alerts
