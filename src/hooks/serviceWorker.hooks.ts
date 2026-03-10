import { useEffect } from 'react'

export function useServiceWorker(scriptPath = './sw.js') {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(scriptPath)
    }
  }, [scriptPath])
}
