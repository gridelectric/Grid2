'use client';

import { BusinessInfoForm } from '@/components/features/onboarding/BusinessInfoForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function BusinessInfoPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#2ea3f2]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#002168]">Business Information</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-500">
            How should we pay you? This information is required for 1099 tax reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}
