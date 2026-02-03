import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/alerts', '/messages', '/sos', '/profile', '/village', '/ai-chat']

// Public routes that should redirect if authenticated
const PUBLIC_ROUTES = ['/login', '/register', '/verify-otp']

const SecureNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    // Handle browser back/forward navigation
    const handlePopState = () => {
      const currentPath = window.location.pathname

      // If user is not authenticated and trying to access protected route
      if (!user && PROTECTED_ROUTES.some(route => currentPath.includes(route))) {
        // Replace current entry in history with login
        window.history.replaceState(null, '', '/login')
        navigate('/login', { replace: true })
        return
      }

      // If user is authenticated and trying to access public route
      if (user && PUBLIC_ROUTES.includes(currentPath)) {
        // Replace current entry in history with dashboard
        window.history.replaceState(null, '', '/dashboard')
        navigate('/dashboard', { replace: true })
        return
      }
    }

    // Add listener for browser navigation
    window.addEventListener('popstate', handlePopState)

    // Check current route and redirect if needed
    const currentPath = location.pathname

    // If user is not authenticated and on protected route
    if (!user && PROTECTED_ROUTES.some(route => currentPath.includes(route))) {
      navigate('/login', { replace: true })
      return
    }

    // If user is authenticated and on public route
    if (user && PUBLIC_ROUTES.includes(currentPath)) {
      navigate('/dashboard', { replace: true })
      return
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [user, loading, navigate, location.pathname])

  // Block navigation if user tries to go back while on login page
  useEffect(() => {
    if (!loading && !user && location.pathname === '/login') {
      // Clear history to prevent going back to protected routes
      window.history.replaceState(null, '', '/login')
    }
  }, [user, loading, location.pathname])

  return null
}

export default SecureNavigation

