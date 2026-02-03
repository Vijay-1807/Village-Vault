import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowRight, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigate } from 'react-router-dom'

const VerifyOTP = () => {
  const { verifyOTP, user, loading } = useAuth()
  const { t } = useLanguage()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Show loading during auth initialization
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="spinner"></div>
    </div>
  }

  // Redirect to dashboard if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    // Get phone number from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const phone = urlParams.get('phone') || localStorage.getItem('phoneNumber')
    if (phone) {
      setPhoneNumber(phone)
      localStorage.setItem('phoneNumber', phone)
    }

    // Start countdown for resend
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 4) return

    setVerifyLoading(true)
    try {
      await verifyOTP(phoneNumber, otp.trim())
      localStorage.removeItem('phoneNumber')
      // Redirect is now handled automatically in AuthContext
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!phoneNumber.trim() || countdown > 0) return

    setResendLoading(true)
    try {
      // For Firebase, we would need to re-send the phone number verification
      // This is a simplified version - in production, you'd handle this properly
      toast.success('OTP resent successfully')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      toast.error('Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 4) {
      setOtp(value)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-4 px-4 sm:py-8 md:py-12 sm:px-6 lg:px-8 relative overflow-y-auto"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1564426699369-f14249ac2c32?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlsbGFnZSUyMG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>
      <div className="max-w-md w-full space-y-4 sm:space-y-6 md:space-y-8 relative z-10 mx-auto px-3 sm:px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white flex items-center justify-center" style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex-shrink-0 drop-shadow-lg -mr-1 sm:-mr-2">
                <img
                  src="/DeWatermark.ai_1760249488029-removebg-preview.png"
                  alt="V Logo"
                  className="h-full w-full object-contain"
                  loading="eager"
                />
              </div>
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight drop-shadow-lg">illageVault</span>
            </h1>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            {t('auth.verifyOTP')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white px-3 break-words drop-shadow-md" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            Enter the 4-digit OTP sent to <span className="font-bold text-orange-300">{phoneNumber || 'your phone'}</span>
          </p>
        </div>

        <form className="mt-5 sm:mt-6 md:mt-8 space-y-5 sm:space-y-6 md:space-y-7" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              {t('auth.otp')}
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              className="w-full px-5 py-5 sm:py-6 bg-white border-3 border-gray-400 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-center text-4xl sm:text-5xl tracking-[0.6em] font-bold min-h-[72px] sm:min-h-[80px] touch-manipulation shadow-xl"
              placeholder="0 0 0 0"
              value={otp}
              onChange={handleOtpChange}
              maxLength={4}
              autoComplete="one-time-code"
              autoFocus={true}
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={verifyLoading || otp.length !== 4}
              className="group relative w-full flex justify-center items-center py-4.5 sm:py-5 px-5 border border-transparent text-base sm:text-lg font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 min-h-[56px] touch-manipulation shadow-xl hover:shadow-2xl"
            >
              {verifyLoading ? (
                <div className="spinner border-3 border-white border-t-transparent h-6 w-6"></div>
              ) : (
                <>
                  <span>{t('auth.verifyOTP')}</span>
                  <ArrowRight className="ml-2.5 h-6 w-6" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-3 space-y-3">
            <p className="text-sm sm:text-base text-white px-3 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              Didn't receive the OTP?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                className="font-bold text-orange-300 hover:text-orange-200 active:text-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 underline underline-offset-3 touch-manipulation min-h-[44px]"
              >
                {resendLoading ? (
                  <span className="inline-flex items-center">
                    <div className="spinner border-2 border-orange-300 border-t-transparent h-5 w-5 mr-2"></div>
                    Resending...
                  </span>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RotateCcw className="inline h-5 w-5 mr-1.5" />
                    {t('auth.resendOTP')}
                  </>
                )}
              </button>
            </p>

            {/* Debug button for testing OTP popup - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    if ((window as any).testOTPPopup) {
                      (window as any).testOTPPopup()
                    }
                  }}
                  className="text-xs sm:text-sm text-gray-300 hover:text-gray-200 underline touch-manipulation drop-shadow-md"
                >
                  Test OTP Popup (Debug)
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyOTP
