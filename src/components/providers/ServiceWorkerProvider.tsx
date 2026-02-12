'use client';

import { useEffect, type ReactNode } from 'react';

import {
  registerBackgroundSyncTags,
  registerGridServiceWorker,
  isServiceWorkerSupported,
} from '@/lib/pwa/serviceWorker';

export function ServiceWorkerProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isServiceWorkerSupported()) {
      return;
    }

    let isMounted = true;

    const registerWorker = async () => {
      try {
        const registration = await registerGridServiceWorker('/sw.js');
        if (!registration || !isMounted) {
          return;
        }

        await registerBackgroundSyncTags(registration);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    void registerWorker();

    const handleOnline = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registerBackgroundSyncTags(registration);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return <>{children}</>;
}
