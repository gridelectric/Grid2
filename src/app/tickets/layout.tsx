'use client';

import { ReactNode } from 'react';
import { AppShell } from '@/components/common/layout/AppShell';
import { useAuth } from '@/components/providers/AuthProvider';

export default function TicketsLayout({ children }: { children: ReactNode }) {
    const { profile } = useAuth();

    const userRole: 'admin' | 'contractor' =
        profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'
            ? 'admin'
            : 'contractor';

    return (
        <AppShell userRole={userRole}>
            {children}
        </AppShell>
    );
}
