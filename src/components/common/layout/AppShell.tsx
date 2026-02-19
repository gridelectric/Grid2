'use client';

import { ReactNode, useState } from 'react';

import { useAuth } from '@/components/providers/AuthProvider';
import { useContractorId } from '@/hooks/useContractorId';
import { useNavigationSignals } from '@/hooks/useNavigationSignals';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  userRole?: 'admin' | 'contractor';
}

export function AppShell({ children, userRole = 'admin' }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const { contractorId } = useContractorId(userRole === 'contractor' ? profile?.id : undefined);
  const { signals, isLoading: isSignalsLoading, refresh } = useNavigationSignals({
    userRole,
    contractorId: userRole === 'contractor' ? contractorId : undefined,
  });
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'User';

  return (
    <div className="min-h-screen bg-grid-shell">
      <TopBar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userName={fullName}
        userRole={profile?.role || 'USER'}
        onRefreshSignals={refresh}
        signals={signals}
        userPortal={userRole}
        isSignalsLoading={isSignalsLoading}
      />

      <div className="flex" style={{ paddingTop: 'calc(var(--top-bar-height) + var(--offline-banner-height))' }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          signals={signals}
          userRole={userRole}
        />

        <main className="flex-1 min-h-[calc(100vh-var(--top-bar-height)-var(--offline-banner-height))] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <BottomNav signals={signals} userRole={userRole} />
    </div>
  );
}
