'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import { getLandingPathForRole } from '@/lib/auth/roleLanding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type LoginProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'role' | 'is_active' | 'must_reset_password'>;

interface ProfilesTableClient {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: LoginProfile | null; error: PostgrestError | null }>;
    };
  };
  update: (values: Database['public']['Tables']['profiles']['Update']) => {
    eq: (column: string, value: string) => Promise<unknown>;
  };
}

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError || !signInData.user) {
        setError('Invalid email or password.');
        return;
      }

      // Generated DB typings are currently incomplete for this table in strict mode.
      const profilesTable = supabase.from('profiles') as unknown as ProfilesTableClient;
      const { data: profile, error: profileError } = await profilesTable
        .select('role, is_active, must_reset_password')
        .eq('id', signInData.user.id)
        .single();

      if (profileError || !profile?.is_active) {
        await supabase.auth.signOut();
        setError('Unable to sign in. Please contact your administrator.');
        return;
      }

      // Best-effort audit metadata update for authentication visibility.
      await profilesTable
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', signInData.user.id);

      const landingPath = profile.must_reset_password
        ? '/set-password'
        : getLandingPathForRole(profile.role);
      router.push(landingPath);
      router.refresh();
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
