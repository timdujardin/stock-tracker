import { useEffect } from 'react';

/** Registers a service worker on mount if the browser supports it. */
/** @param scriptPath - Path to the service worker script. */
/** @returns void */
export const useServiceWorker = (scriptPath = './sw.js') => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(scriptPath);
    }
  }, [scriptPath]);
};
