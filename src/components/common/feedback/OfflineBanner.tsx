'use client';

import { useEffect, useState } from 'react';

export function readOnlineStatus(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

export function shouldRenderOfflineBanner(isOnline: boolean): boolean {
  return !isOnline;
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(readOnlineStatus);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!shouldRenderOfflineBanner(isOnline)) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950 shadow-sm"
      role="status"
    >
      You are offline. Changes will be queued and synced when connection is restored.
    </div>
  );
}
