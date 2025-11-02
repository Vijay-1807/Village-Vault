import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useSocket } from '../contexts/SocketContext'
import { useNavigate } from 'react-router-dom'
import { Menu, Globe, Wifi, WifiOff } from 'lucide-react'

const Header = ({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) => {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { isConnected } = useSocket()
  const navigate = useNavigate()
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false)
      }
    }

    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isLanguageMenuOpen])

  const languages = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'hi', name: 'हिन्दी', flag: 'HI' },
    { code: 'te', name: 'తెలుగు', flag: 'TE' },
    { code: 'ta', name: 'தமிழ்', flag: 'TA' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: 'KN' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <header className="village-header sticky top-0 z-50 w-full">
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-xl text-white hover:text-orange-400 hover:bg-orange-500/20 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Logo and title - centered */}
          <div className="flex-1 flex justify-center items-center min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 max-w-full">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <img 
                  src="/DeWatermark.ai_1760249488029-removebg-preview.png" 
                  alt="VillageVault Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-2 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-orange-400 truncate">{t('app.title')}</h1>
                <span className="hidden sm:inline text-white/60">-</span>
                <p className="hidden sm:block text-xs lg:text-sm text-white/90 font-medium truncate">Unified Village Communication System</p>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-orange-500/30">
              {/* Network status */}
              <div className="flex items-center" title={isOnline ? 'Network Online' : 'Network Offline'}>
                {isOnline ? (
                  <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                )}
              </div>
              
              {/* Socket status */}
              <div className="flex items-center" title={isConnected ? 'Server Connected' : 'Server Disconnected'}>
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>

            {/* Language selector */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLanguageMenuOpen(!isLanguageMenuOpen)
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-orange-500/30 rounded-lg sm:rounded-xl hover:bg-white/20 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-orange-500/20 min-h-[44px]"
                aria-label="Select language"
                aria-expanded={isLanguageMenuOpen}
              >
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline font-mono text-xs bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">{currentLanguage?.flag}</span>
                <span className="hidden md:inline truncate">{currentLanguage?.name}</span>
                <span className="md:hidden truncate">{currentLanguage?.flag}</span>
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-50 border border-white/20 animate-fadeInUp">
                  <div className="py-2 max-h-[80vh] overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setIsLanguageMenuOpen(false)
                        }}
                        className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm hover:bg-blue-50 transition-colors duration-200 min-h-[44px] flex items-center ${
                          language === lang.code ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mr-2 flex-shrink-0">{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User info - hidden on mobile */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-orange-500/30 hover:bg-white/20 hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-orange-400 capitalize font-medium">{user?.role?.toLowerCase()}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </header>
  )
}

export default Header
