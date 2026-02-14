import { ReactNode } from 'react';
import { forbidden, redirect } from 'next/navigation';
import { AppShell } from '@/components/common/layout/AppShell';
import { getPortalRole } from '@/lib/auth/portalAccess';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilesTable = admin.from('profiles') as any;
  const { data: profile } = await profilesTable
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (getPortalRole(profile?.role as string | null | undefined) !== 'admin') {
    forbidden();
  }

  return (
    <AppShell userRole="admin">
      {children}
    </AppShell>
  );
}
