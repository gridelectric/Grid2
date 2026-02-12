'use client';

import { ReactNode } from 'react';
import { OnboardingProgress } from '@/components/features/onboarding/OnboardingProgress';
import { OnboardingProvider } from '@/components/providers/OnboardingProvider';
import { Zap } from 'lucide-react';

export default function OnboardingLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Grid Electric Logo */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#002168] to-[#2ea3f2]">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-[#002168] text-lg tracking-tight">
                  Grid Electric
                </span>
                <span className="block text-xs text-gray-500 -mt-1">
                  Contractor Portal
                </span>
              </div>
            </div>
            <OnboardingProgress />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Grid Electric Corp. All rights reserved.
          </p>
        </footer>
      </div>
    </OnboardingProvider>
  );
}
