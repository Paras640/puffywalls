'use client';

import { useEffect } from 'react';

export default function ServiceWorkerBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch((error) => {
        console.warn('Failed to unregister service worker:', error);
      });
  }, []);

  return null;
}
