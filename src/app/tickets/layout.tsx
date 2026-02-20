'use client';

import { ReactNode } from 'react';
import { AppShell } from '@/components/common/layout/AppShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { isAdminClassRole } from '@/lib/auth/roleGuards';

export default function TicketsLayout({ children }: { children: ReactNode }) {
    const { profile } = useAuth();

    const userRole: 'admin' | 'contractor' =
        isAdminClassRole(profile?.role)
            ? 'admin'
            : 'contractor';

    return (
        <AppShell userRole={userRole}>
            {children}
        </AppShell>
    );
}
