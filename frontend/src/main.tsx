import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'
import 'sweetalert2/dist/sweetalert2.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SocketProvider } from './contexts/SocketContext.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'

// Clear all service workers and caches to prevent network errors
if ('serviceWorker' in navigator) {
  // Clear immediately on page load
  (async () => {
    try {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      }
    } catch (error) {
      console.log('Error clearing service workers:', error);
    }
  })();

  // Also clear on window load as backup
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    } catch (error) {
      console.log('Error clearing service workers on load:', error);
    }
  });

  // Clear on page visibility change (when user returns to tab)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      } catch (error) {
        console.log('Error clearing service workers on visibility change:', error);
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '1px solid #374151'
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#1f2937',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#1f2937',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
