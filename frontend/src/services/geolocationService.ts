// Geolocation Service for SOS and Location Services
export interface LocationData {
  lat: number
  lon: number
  accuracy: number
  address?: string
  city?: string
  state?: string
  country?: string
  timestamp: number
}

export interface SOSLocationData extends LocationData {
  emergencyType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

class GeolocationService {
  private readonly GOOGLE_MAPS_API_KEY = 'demo' // Replace with your API key
  private readonly REVERSE_GEOCODING_BASE = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

  // Get current location using browser geolocation
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords
          
          try {
            // Get address from coordinates
            const addressData = await this.reverseGeocode(latitude, longitude)
            
            resolve({
              lat: latitude,
              lon: longitude,
              accuracy,
              address: addressData.address,
              city: addressData.city,
              state: addressData.state,
              country: addressData.country,
              timestamp: Date.now()
            })
          } catch (error) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              lat: latitude,
              lon: longitude,
              accuracy,
              timestamp: Date.now()
            })
          }
        },
        (error) => {
          let message = 'Unable to get location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable'
              break
            case error.TIMEOUT:
              message = 'Location request timed out'
              break
          }
          reject(new Error(message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(lat: number, lon: number): Promise<{
    address: string
    city: string
    state: string
    country: string
  }> {
    try {
      const response = await fetch(
        `${this.REVERSE_GEOCODING_BASE}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      )
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }
      
      const data = await response.json()
      
      return {
        address: data.localityInfo?.administrative?.[0]?.name || 'Unknown Address',
        city: data.city || data.locality || 'Unknown City',
        state: data.principalSubdivision || 'Unknown State',
        country: data.countryName || 'Unknown Country'
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Return fallback data
      return {
        address: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'Unknown Country'
      }
    }
  }

  // Get location for SOS emergency
  async getSOSLocation(emergencyType: string, severity: 'low' | 'medium' | 'high' | 'critical', description: string): Promise<SOSLocationData> {
    try {
      const location = await this.getCurrentLocation()
      
      return {
        ...location,
        emergencyType,
        severity,
        description
      }
    } catch (error) {
      console.error('SOS location error:', error)
      // Return fallback location data
      return {
        lat: 16.3067, // Default to Guntur coordinates
        lon: 80.4365,
        accuracy: 0,
        address: 'Location unavailable',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        country: 'India',
        timestamp: Date.now(),
        emergencyType,
        severity,
        description
      }
    }
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Convert degrees to radians
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  // Get nearby emergency services (mock data)
  getNearbyEmergencyServices(lat: number, lon: number): Array<{
    name: string
    type: string
    distance: number
    phone: string
    address: string
  }> {
    // Mock emergency services data
    const services = [
      { name: 'Police Station', type: 'Police', phone: '100', address: 'Main Road, Guntur' },
      { name: 'Fire Station', type: 'Fire', phone: '101', address: 'Station Road, Guntur' },
      { name: 'Hospital', type: 'Medical', phone: '108', address: 'Medical College, Guntur' },
      { name: 'Ambulance', type: 'Medical', phone: '108', address: 'Emergency Services' }
    ]

    return services.map(service => ({
      ...service,
      distance: Math.round(this.calculateDistance(lat, lon, 16.3067, 80.4365) * 100) / 100
    }))
  }

  // Format location for display
  formatLocation(location: LocationData): string {
    if (location.address) {
      return `${location.address}, ${location.city}, ${location.state}`
    }
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
  }

  // Check if location is within village bounds (mock implementation)
  isWithinVillageBounds(lat: number, lon: number): boolean {
    // Mock village bounds (Guntur area)
    const villageBounds = {
      north: 16.4,
      south: 16.2,
      east: 80.5,
      west: 80.3
    }
    
    return lat >= villageBounds.south && 
           lat <= villageBounds.north && 
           lon >= villageBounds.west && 
           lon <= villageBounds.east
  }
}

export const geolocationService = new GeolocationService()
