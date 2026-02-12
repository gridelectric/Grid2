'use client';

import { CredentialsForm } from '@/components/features/onboarding/CredentialsForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function CredentialsPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#2ea3f2]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#002168]">Professional Credentials</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-500">
            Share your qualifications and certifications. This helps us match you with appropriate assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CredentialsForm />
        </CardContent>
      </Card>
    </div>
  );
}
