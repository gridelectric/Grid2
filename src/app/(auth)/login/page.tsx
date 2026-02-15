// Login Page

import { Metadata } from 'next';
import Link from 'next/link';

import { BrandMark } from '@/components/common/brand/BrandMark';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sign In - Grid Electric Services',
  description: 'Sign in to your Grid Electric Services account',
};

export default function LoginPage() {
  return (
    <Card className="storm-surface w-full shadow-card">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <BrandMark portalLabel="Secure Access" variant="full" />
        </div>
        <CardTitle className="text-2xl font-bold text-grid-navy">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Grid Electric Services account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        
        <div className="flex items-center justify-between text-sm">
          <Link 
            href="/forgot-password" 
            className="font-medium text-grid-blue hover:text-grid-blue-dark"
          >
            Forgot password?
          </Link>
          <Link 
            href="/magic-link" 
            className="font-medium text-grid-blue hover:text-grid-blue-dark"
          >
            Use magic link
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
