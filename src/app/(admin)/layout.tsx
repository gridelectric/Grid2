import { ReactNode } from 'react';
import { forbidden, redirect } from 'next/navigation';
import { AppShell } from '@/components/common/layout/AppShell';
import { getPortalRole } from '@/lib/auth/portalAccess';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;

interface ProfilesRoleTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: ProfileRole | null; error: unknown }>;
    };
  };
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profilesTable = supabase.from('profiles') as unknown as ProfilesRoleTableClient;
  const { data: profile } = await profilesTable
    .select('role')
    .eq('id', user.id)
    .single();

  if (getPortalRole(profile?.role) !== 'admin') {
    forbidden();
  }

  return (
    <AppShell userRole="admin">
      {children}
    </AppShell>
  );
}
