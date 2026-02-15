// Forgot Password Page

import { Metadata } from 'next';
import Link from 'next/link';

import { BrandMark } from '@/components/common/brand/BrandMark';
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Forgot Password - Grid Electric Services',
  description: 'Reset your Grid Electric Services account password',
};

export default function ForgotPasswordPage() {
  return (
    <Card className="storm-surface w-full shadow-card">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <BrandMark portalLabel="Secure Access" variant="full" />
        </div>
        <CardTitle className="text-2xl font-bold text-grid-navy">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgotPasswordForm />
        
        <div className="text-center text-sm">
          <Link 
            href="/login" 
            className="font-medium text-grid-blue hover:text-grid-blue-dark"
          >
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
