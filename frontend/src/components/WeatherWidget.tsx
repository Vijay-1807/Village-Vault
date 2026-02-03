import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, MapPin, Search, RefreshCw } from 'lucide-react'
import { weatherService, WeatherData } from '../services/weatherService'

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationInput, setLocationInput] = useState('') // Start empty
  const [inputType, setInputType] = useState<'pincode' | 'coordinates' | 'city'>('city')
  // const [currentLocation, setCurrentLocation] = useState<{lat: number, lon: number, city: string} | null>(null)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            // setCurrentLocation({ lat: latitude, lon: longitude, city: 'Current Location' })
            await fetchWeatherByCoordinates(latitude, longitude)
          },
          (error) => {
            console.log('Geolocation error:', error)
            // Fallback to default location
            fetchWeatherByCoordinates(16.3067, 80.4365)
          }
        )
      } else {
        // Fallback to default location
        fetchWeatherByCoordinates(16.3067, 80.4365)
      }
    } catch (error) {
      console.error('Location error:', error)
      fetchWeatherByCoordinates(16.3067, 80.4365)
    }
  }

  const fetchWeatherByCoordinates = async (lat: number, lon: number, cityName?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch real weather data
      const weatherData = await weatherService.getWeatherData(lat, lon)

      // Fetch air quality data
      const airQuality = await weatherService.getAirQualityData(lat, lon)

      // Update weather data with location and air quality
      const updatedWeather: WeatherData = {
        ...weatherData,
        city: cityName || weatherData.city,
        airQuality
      }

      setWeather(updatedWeather)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeather = async (customLocation?: string) => {
    try {
      setLoading(true)
      setError(null)

      const location = customLocation || locationInput
      let coordinates: { lat: number, lon: number, city: string, state: string }

      if (inputType === 'pincode') {
        // Get coordinates from PIN code
        const locationData = await weatherService.getCoordinatesFromPincode(location)
        coordinates = {
          lat: locationData.lat,
          lon: locationData.lon,
          city: locationData.city,
          state: locationData.state
        }
      } else if (inputType === 'coordinates') {
        // Parse coordinates
        const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()))
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error('Invalid coordinates format')
        }
        coordinates = {
          lat,
          lon,
          city: 'Custom Location',
          state: 'Unknown'
        }
      } else {
        // City name - use geocoding
        const locationData = await weatherService.getCoordinatesFromCity(location)
        coordinates = {
          lat: locationData.lat,
          lon: locationData.lon,
          city: locationData.city,
          state: locationData.state
        }
      }

      await fetchWeatherByCoordinates(coordinates.lat, coordinates.lon, coordinates.city)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case 'sn': return <CloudSnow className="h-8 w-8 text-blue-400" />
      case 'sl': return <CloudSnow className="h-8 w-8 text-blue-400" />
      case 'h': return <CloudRain className="h-8 w-8 text-gray-500" />
      case 't': return <CloudRain className="h-8 w-8 text-gray-500" />
      case 'hr': return <CloudRain className="h-8 w-8 text-blue-600" />
      case 'lr': return <CloudRain className="h-8 w-8 text-blue-500" />
      case 's': return <CloudRain className="h-8 w-8 text-blue-500" />
      case 'hc': return <Cloud className="h-8 w-8 text-gray-400" />
      case 'lc': return <Cloud className="h-8 w-8 text-gray-300" />
      case 'c': return <Sun className="h-8 w-8 text-yellow-400" />
      default: return <Sun className="h-8 w-8 text-yellow-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
        <span className="ml-3 text-white/80">Loading weather...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <Cloud className="h-12 w-12 text-white/60 mx-auto mb-3" />
        <p className="text-white/80">{error}</p>
        <button
          onClick={() => fetchWeather()}
          className="mt-3 px-4 py-2 bg-blue-500/80 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-blue-600/80 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!weather) return null

  const handleSearch = () => {
    if (locationInput.trim()) {
      fetchWeather(locationInput.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="p-6 hover:scale-105 transition-transform duration-300">
      {/* Location Input */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="h-4 w-4 text-white/80" />
          <span className="text-sm font-medium text-white">Location</span>
        </div>

        {/* Input Type Toggle */}
        <div className="flex space-x-1 mb-2">
          <button
            onClick={() => setInputType('city')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${inputType === 'city'
              ? 'bg-blue-500/80 text-white backdrop-blur-sm border border-white/20'
              : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm border border-white/10'
              }`}
          >
            City
          </button>
          <button
            onClick={() => setInputType('pincode')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${inputType === 'pincode'
              ? 'bg-blue-500/80 text-white backdrop-blur-sm border border-white/20'
              : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm border border-white/10'
              }`}
          >
            PIN Code
          </button>
          <button
            onClick={() => setInputType('coordinates')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${inputType === 'coordinates'
              ? 'bg-blue-500/80 text-white backdrop-blur-sm border border-white/20'
              : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm border border-white/10'
              }`}
          >
            Lat, Lon
          </button>
        </div>

        {/* Input Field */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              inputType === 'city'
                ? 'Enter city name (e.g., Mumbai, New York, London)'
                : inputType === 'pincode'
                  ? 'Enter PIN code (e.g., 522508)'
                  : 'Enter coordinates (e.g., 16.3067, 80.4365)'
            }
            className="flex-1 px-3 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-3 py-2 bg-blue-500/80 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weather Display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Current Weather</h3>
          <p className="text-sm text-white/70">{weather.city}, {weather.country}</p>
        </div>
        {getWeatherIcon(weather.icon)}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Thermometer className="h-6 w-6 text-red-400 mr-2" />
          <span className="text-3xl font-bold text-white">{weather.temperature}°C</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white/80 capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 text-blue-400 mr-2" />
          <span className="text-sm text-white/80">Humidity: {weather.humidity}%</span>
        </div>
        <div className="flex items-center">
          <Wind className="h-4 w-4 text-white/60 mr-2" />
          <span className="text-sm text-white/80">Wind: {weather.windSpeed} km/h</span>
        </div>
      </div>

      {/* Air Quality Section */}
      {weather.airQuality && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Air Quality</span>
            <span className={`text-xs px-2 py-1 rounded-full ${weather.airQuality.aqi <= 50 ? 'bg-green-500/20 text-green-300' :
              weather.airQuality.aqi <= 100 ? 'bg-yellow-500/20 text-yellow-300' :
                weather.airQuality.aqi <= 150 ? 'bg-orange-500/20 text-orange-300' :
                  'bg-red-500/20 text-red-300'
              }`}>
              {weather.airQuality.level}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>AQI: {weather.airQuality.aqi}</div>
            <div>PM2.5: {weather.airQuality.pm25}μg/m³</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
        <button
          onClick={() => getCurrentLocation()}
          disabled={loading}
          className="w-full flex items-center justify-center px-3 py-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use Current Location
        </button>
        <button
          onClick={() => fetchWeather()}
          disabled={loading}
          className="w-full flex items-center justify-center px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Refresh Weather'}
        </button>
      </div>
    </div>
  )
}

export default WeatherWidget
