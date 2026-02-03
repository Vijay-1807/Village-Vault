import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import OfflineIndicator from './OfflineIndicator'
import AIChatWidget from './AIChatWidget'
import { useState } from 'react'

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <Header onMobileMenuToggle={toggleMobileMenu} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      {!location.pathname.startsWith('/messages') && <AIChatWidget />}

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}

export default Layout
