// Auth Layout - Minimal layout for authentication pages

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="safe-area-pr safe-area-pl relative min-h-screen bg-grid-shell px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-grid-storm-100 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        {children}
      </div>
    </div>
  );
}
