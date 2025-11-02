import { useEffect, useRef } from 'react'

/**
 * Custom hook for auto-scrolling to bottom when content changes
 */
export const useAutoScroll = <T>(dependencies: T[], options: {
  behavior?: ScrollBehavior
  enabled?: boolean
} = {}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { behavior = 'smooth', enabled = true } = options

  useEffect(() => {
    if (!enabled || !scrollRef.current) return

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, dependencies)

  return scrollRef
}

