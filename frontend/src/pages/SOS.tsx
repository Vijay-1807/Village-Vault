import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import { geolocationService, SOSLocationData } from '../services/geolocationService'
import { aiService } from '../services/aiService'
import { Phone, AlertTriangle, CheckCircle, Clock, MapPin, Navigation, Bot } from 'lucide-react'
import alertService from '../services/alertService'

interface SOSReport {
  id: string
  type?: string
  description?: string
  location?: string
  priority: string
  status: string
  createdAt: string
  reporterId?: string
  reporterName?: string
  reporterPhone?: string
  reporterPinCode?: string
  reporterVillageName?: string
  // Geolocation data
  coordinates?: {
    lat: number
    lon: number
    accuracy: number
  }
  address?: string
  // Legacy support for nested reporter object
  reporter?: {
    id: string
    name: string
    phoneNumber: string
    pinCode: string
    villageName: string
  }
}

const SOS = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [sosReports, setSosReports] = useState<SOSReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)

  const [newSOS, setNewSOS] = useState({
    description: '',
    location: '',
    priority: 'EMERGENCY'
  })
  const [locationData, setLocationData] = useState<SOSLocationData | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false)

  const { socket, isConnected } = useSocket()

  useEffect(() => {
    fetchSOSReports()
  }, [])

  // Real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('newSOS', () => {
        // Optimistically add to list or fetch fresh
        // For simplicity and to ensure sorted order/normalized data, fetching fresh is safer unless we normalize here
        fetchSOSReports()
      })

      socket.on('sosStatusUpdate', ({ reportId, status }) => {
        setSosReports(prev => prev.map(report =>
          report.id === reportId ? { ...report, status } : report
        ))
      })

      return () => {
        socket.off('newSOS')
        socket.off('sosStatusUpdate')
      }
    }
  }, [socket, isConnected])

  const fetchSOSReports = async () => {
    try {
      const response = await api.get('/sos')
      const sosReports = response.data.data.sosReports || []

      // Normalize SOS reports data to ensure all required fields exist
      const normalizedReports = sosReports.map((report: any) => ({
        ...report,
        reporterName: report.reporterName || report.reporter?.name || 'Unknown',
        reporterPhone: report.reporterPhone || report.reporter?.phoneNumber || '',
        reporterPinCode: report.reporterPinCode || report.reporter?.pinCode || '',
        reporterVillageName: report.reporterVillageName || report.reporter?.villageName || '',
        type: report.type || 'OTHER',
        description: report.description || '',
        location: report.location || '',
        priority: report.priority || 'MEDIUM',
        status: report.status || 'PENDING'
      }))

      setSosReports(normalizedReports)
    } catch (error) {
      console.error('Failed to fetch SOS reports:', error)
      alertService.error('Failed to fetch SOS reports')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    setGettingLocation(true)
    try {
      const location = await geolocationService.getSOSLocation(
        newSOS.description,
        newSOS.priority === 'EMERGENCY' ? 'high' : 'medium',
        newSOS.description
      )

      setLocationData(location)
      setNewSOS(prev => ({
        ...prev,
        location: geolocationService.formatLocation(location)
      }))

      alertService.success('Location captured successfully')
    } catch (error: any) {
      console.error('Location error:', error)
      alertService.error(error.message || 'Unable to get location')
    } finally {
      setGettingLocation(false)
    }
  }

  const handleCreateSOS = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSOS.description.trim()) return

    setCreateLoading(true)
    try {
      const sosData: any = {
        ...newSOS,
        type: 'OTHER', // Default type
        villageId: user?.villageId || 'test-village-id'
      }

      // Add geolocation data if available
      if (locationData) {
        sosData.coordinates = {
          lat: locationData.lat,
          lon: locationData.lon,
          accuracy: locationData.accuracy
        }
        sosData.address = locationData.address
      }

      await api.post('/sos', sosData)
      alertService.success(t('sos.reportCreated'))

      setShowCreateForm(false)
      setNewSOS({
        description: '',
        location: '',
        priority: 'EMERGENCY'
      })
      setLocationData(null)
      fetchSOSReports()
    } catch (error: any) {
      alertService.error(error.response?.data?.message || 'Failed to create SOS report')
    } finally {
      setCreateLoading(false)
    }
  }

  const analyzeWithAI = async () => {
    if (!newSOS.description.trim()) {
      alertService.error('Please enter emergency description first')
      return
    }

    setAnalyzingWithAI(true)
    try {
      const response = await aiService.analyzeEmergency(
        newSOS.description,
        newSOS.location || 'Unknown location'
      )
      setAiAnalysis(response.content)
      alertService.success('AI analysis completed')
    } catch (error) {
      console.error('AI analysis error:', error)
      alertService.error('AI analysis failed')
    } finally {
      setAnalyzingWithAI(false)
    }
  }

  const handleUpdateStatus = async (reportId: string, status: string) => {
    if (user?.role !== 'SARPANCH') return

    setUpdateLoading(reportId)
    try {
      await api.patch(`/sos/${reportId}/status`, { status })
      alertService.success(t('sos.statusUpdated'))
      fetchSOSReports()
    } catch (error: any) {
      alertService.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdateLoading(null)
    }
  }

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
        return t('sos.emergency')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100'
      case 'acknowledged':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved':
        return t('sos.status.resolved')
      case 'acknowledged':
        return t('sos.status.acknowledged')
      case 'pending':
        return t('sos.status.pending')
      default:
        return status
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
    <div className="h-full overflow-y-auto space-y-8 animate-fade-in-up p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="village-card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse-gentle flex-shrink-0">
              <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 mb-2 break-words">{t('sos.title')}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Emergency reporting and management system</p>
              {sosReports.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-600">
                    <span className="font-semibold text-red-600">{sosReports.filter(r => r.status === 'PENDING').length}</span> Pending
                  </span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span className="text-gray-600">
                    <span className="font-semibold text-blue-600">{sosReports.filter(r => r.status === 'ACKNOWLEDGED').length}</span> Acknowledged
                  </span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span className="text-gray-600">
                    <span className="font-semibold text-green-600">{sosReports.filter(r => r.status === 'RESOLVED').length}</span> Resolved
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {user?.role === 'SARPANCH' && sosReports.filter(r => r.status === 'pending').length > 0 && (
              <button
                onClick={() => {
                  // Acknowledge all pending reports
                  const pendingReports = sosReports.filter(r => r.status === 'pending')
                  pendingReports.forEach(report => {
                    handleUpdateStatus(report.id, 'acknowledged')
                  })
                }}
                className="flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Acknowledge All
              </button>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-danger flex items-center justify-center shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Phone className="h-5 w-5 mr-2" />
              {t('sos.create')}
            </button>
          </div>
        </div>
      </div>

      {/* Create SOS Form */}
      {showCreateForm && (
        <div className="village-emergency-card animate-slide-in-right">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h2 className="village-section-title text-2xl">Report Emergency</h2>
          </div>
          <form onSubmit={handleCreateSOS} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sos.description')} *
              </label>
              <textarea
                required
                rows={3}
                className="input-field"
                value={newSOS.description}
                onChange={(e) => setNewSOS(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the emergency situation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sos.location')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={newSOS.location}
                  onChange={(e) => setNewSOS(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location (optional)"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-full sm:w-auto"
                >
                  {gettingLocation ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      <span className="sm:hidden">Get Location</span>
                    </>
                  )}
                </button>
              </div>
              {locationData && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-sm text-green-700">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="font-medium">Location captured:</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">{locationData.address}</p>
                  <p className="text-xs text-green-600">Accuracy: ±{Math.round(locationData.accuracy)}m</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="input-field"
                value={newSOS.priority}
                onChange={(e) => setNewSOS(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="EMERGENCY">{t('sos.emergency')}</option>
                <option value="HIGH">{t('alerts.priority.high')}</option>
                <option value="MEDIUM">{t('alerts.priority.medium')}</option>
                <option value="LOW">{t('alerts.priority.low')}</option>
              </select>
            </div>

            {/* AI Analysis Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  AI Emergency Analysis
                </label>
                <button
                  type="button"
                  onClick={analyzeWithAI}
                  disabled={analyzingWithAI || !newSOS.description.trim()}
                  className="flex items-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {analyzingWithAI ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              </div>

              {aiAnalysis && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Bot className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-purple-900 mb-2">AI Emergency Analysis:</h4>
                      <div className="text-sm text-purple-800 whitespace-pre-wrap">
                        {aiAnalysis}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary w-full sm:w-auto"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={createLoading || !newSOS.description.trim()}
                className="btn-danger w-full sm:w-auto"
              >
                {createLoading ? <div className="spinner"></div> : 'Report Emergency'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SOS Reports List */}
      <div className="village-card">
        {sosReports.length > 0 ? (
          <div className="space-y-6">
            {sosReports.map((report) => (
              <div key={report.id} className="p-4 sm:p-6 bg-gradient-to-br from-white/90 to-red-50/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-red-100 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(report.priority)}`}>
                            {getPriorityText(report.priority)}
                          </span>
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                        </div>

                        {report.description && (
                          <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-medium break-words">{report.description}</p>
                        )}

                        {report.location && (
                          <p className="mt-2 text-xs sm:text-sm text-gray-600 break-words">
                            <span className="font-semibold text-gray-700">📍 Location:</span> {report.location}
                          </p>
                        )}

                        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Reported by: {report.reporterName || report.reporter?.name || 'Unknown'}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 w-full">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {user?.role === 'SARPANCH' && report.status !== 'RESOLVED' && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        {report.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'ACKNOWLEDGED')}
                            disabled={updateLoading === report.id}
                            className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                          >
                            {updateLoading === report.id ? (
                              <div className="spinner mr-2"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Acknowledge
                          </button>
                        )}
                        {report.status === 'ACKNOWLEDGED' && (
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                            disabled={updateLoading === report.id}
                            className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-green-700 bg-green-100 rounded-xl hover:bg-green-200 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                          >
                            {updateLoading === report.id ? (
                              <div className="spinner mr-2"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    )}

                    {/* Show message for non-Sarpanch users */}
                    {user?.role !== 'SARPANCH' && report.status === 'PENDING' && (
                      <div className="text-xs sm:text-sm text-gray-500 italic">
                        Waiting for village administration response
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No SOS reports yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {user?.role === 'SARPANCH' ? 'SOS reports from villagers will appear here for your attention.' : 'Report an emergency to get help quickly from your village administration.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SOS
