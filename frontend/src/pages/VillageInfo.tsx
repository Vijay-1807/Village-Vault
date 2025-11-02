import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import { weatherService } from '../services/weatherService'
import { MapPin, Users, Wind, Eye, Activity, RefreshCw } from 'lucide-react'
import WeatherWidget from '../components/WeatherWidget'

interface Village {
  pinCode: string
  name: string
  state: string
  district: string
  users: Array<{
    id: string
    name: string
    role: string
    createdAt: string
  }>
}

interface VillageStats {
  totalUsers: number
  totalVillagers: number
  totalAlerts: number
  pendingSOSReports: number
  recentActivity: number
}

interface AirQualityData {
  aqi: number
  pm25: number
  pm10: number
  level: string
  color: string
  healthAdvice: string
}

const VillageInfo = () => {
  const { t } = useLanguage()
  const [village, setVillage] = useState<Village | null>(null)
  const [stats, setStats] = useState<VillageStats | null>(null)
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [airQualityLoading, setAirQualityLoading] = useState(false)

  useEffect(() => {
    fetchVillageData()
    fetchAirQuality()
  }, [])

  const fetchVillageData = async () => {
    try {
      const [villageResponse, statsResponse] = await Promise.all([
        api.get('/villages/current'),
        api.get('/villages/stats')
      ])

      setVillage(villageResponse.data.data.village)
      setStats(statsResponse.data.data.stats)
    } catch (error) {
      console.error('Failed to fetch village data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAirQuality = async () => {
    setAirQualityLoading(true)
    try {
      // Get village coordinates (using default for demo)
      const lat = 16.3067
      const lon = 80.4365
      
      const airQualityData = await weatherService.getAirQualityData(lat, lon)
      
      if (!airQualityData) {
        throw new Error('Air quality data not available')
      }
      
      const level = airQualityData.level
      const aqi = airQualityData.aqi
      
      // Determine color and health advice based on AQI
      let color = 'green'
      let healthAdvice = 'Air quality is good. Enjoy outdoor activities.'
      
      if (aqi <= 50) {
        color = 'green'
        healthAdvice = 'Air quality is good. Enjoy outdoor activities.'
      } else if (aqi <= 100) {
        color = 'yellow'
        healthAdvice = 'Air quality is moderate. Sensitive people may experience minor breathing discomfort.'
      } else if (aqi <= 150) {
        color = 'orange'
        healthAdvice = 'Air quality is unhealthy for sensitive groups. Limit outdoor activities.'
      } else if (aqi <= 200) {
        color = 'red'
        healthAdvice = 'Air quality is unhealthy. Avoid outdoor activities, especially for sensitive groups.'
      } else if (aqi <= 300) {
        color = 'purple'
        healthAdvice = 'Air quality is very unhealthy. Stay indoors with windows closed.'
      } else {
        color = 'maroon'
        healthAdvice = 'Air quality is hazardous. Avoid all outdoor activities.'
      }
      
      setAirQuality({
        aqi,
        pm25: airQualityData.pm25,
        pm10: airQualityData.pm10,
        level,
        color,
        healthAdvice
      })
    } catch (error) {
      console.error('Failed to fetch air quality:', error)
    } finally {
      setAirQualityLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!village) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Village not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load village information.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full bg-black overflow-y-auto animate-fadeInUp">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 mb-3 sm:mb-4 break-words">
              {t('village.title')}
            </h1>
            <div className="h-1 w-24 sm:w-32 md:w-40 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-white/90 text-sm sm:text-base md:text-lg mt-4 sm:mt-6 font-medium">
            Information about your village community
          </p>
        </div>

      {/* Village Overview */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-6 shadow-xl rounded-lg sm:rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/80 to-blue-500/80 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
            <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">{village.name}</h2>
            <p className="text-white/80 text-base sm:text-lg font-medium break-words">{village.district}, {village.state}</p>
            <p className="text-xs sm:text-sm text-white/70 font-medium">PIN Code: {village.pinCode}</p>
          </div>
        </div>
      </div>

      {/* People Count and Weather */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* People Count */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-6 shadow-xl hover:scale-[1.02] transition-transform duration-300 rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white break-words">Village Population</h3>
              <p className="text-xs sm:text-sm text-white/70">Total registered members</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/80 to-blue-600/80 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl sm:text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
            <p className="text-xs sm:text-sm text-white/70 mt-1 break-words">People in {village.name}</p>
          </div>
        </div>
        
        {/* Weather Widget */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-lg sm:rounded-xl overflow-hidden">
          <WeatherWidget />
        </div>
      </div>

      {/* Air Quality Monitoring */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-6 shadow-xl rounded-lg sm:rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500/80 to-blue-500/80 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
              <Wind className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white break-words">Air Quality Monitor</h3>
              <p className="text-xs sm:text-sm text-white/70 break-words">Real-time air quality data for {village.name}</p>
            </div>
          </div>
          <button
            onClick={fetchAirQuality}
            disabled={airQualityLoading}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] w-full sm:w-auto text-xs sm:text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 flex-shrink-0 ${airQualityLoading ? 'animate-spin' : ''}`} />
            {airQualityLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        {airQuality ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* AQI Display */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-white/80 break-words">Air Quality Index</span>
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 ${
                  airQuality.color === 'green' ? 'bg-green-500' :
                  airQuality.color === 'yellow' ? 'bg-yellow-500' :
                  airQuality.color === 'orange' ? 'bg-orange-500' :
                  airQuality.color === 'red' ? 'bg-red-500' :
                  airQuality.color === 'purple' ? 'bg-purple-500' :
                  'bg-red-800'
                }`}>
                  {airQuality.aqi}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm sm:text-base break-words">{airQuality.level}</p>
                  <p className="text-[10px] sm:text-xs text-white/60">AQI</p>
                </div>
              </div>
            </div>

            {/* PM2.5 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-white/80">PM2.5</span>
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{airQuality.pm25} μg/m³</p>
              <p className="text-[10px] sm:text-xs text-white/60">Fine particles</p>
            </div>

            {/* PM10 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-white/80">PM10</span>
                <Wind className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{airQuality.pm10} μg/m³</p>
              <p className="text-[10px] sm:text-xs text-white/60">Coarse particles</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wind className="h-12 w-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">Air quality data unavailable</p>
          </div>
        )}

        {/* Health Advice */}
        {airQuality && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white mb-1">Health Advice</p>
                <p className="text-xs sm:text-sm text-white/80 break-words">{airQuality.healthAdvice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default VillageInfo
