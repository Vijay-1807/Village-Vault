/**
 * Environment-based logger utility
 * Only logs in development mode to avoid exposing sensitive data in production
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log('[VillageVault]', ...args)
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors for debugging in production
    console.error('[VillageVault Error]', ...args)
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn('[VillageVault Warning]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info('[VillageVault Info]', ...args)
    }
  },
  
  debug: (...args: any[]) => {
    if (isDev && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.debug('[VillageVault Debug]', ...args)
    }
  }
}

