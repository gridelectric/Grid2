// Reset Password Page

import { Metadata } from 'next';
import Link from 'next/link';

import { BrandMark } from '@/components/common/brand/BrandMark';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Reset Password - Grid Electric Services',
  description: 'Create a new password for your Grid Electric Services account',
};

export default function ResetPasswordPage() {
  return (
    <Card className="storm-surface w-full shadow-card">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <BrandMark portalLabel="Secure Access" variant="full" />
        </div>
        <CardTitle className="text-2xl font-bold text-grid-navy">Create new password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResetPasswordForm />
        
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
