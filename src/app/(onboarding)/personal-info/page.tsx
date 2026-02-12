'use client';

import { PersonalInfoForm } from '@/components/features/onboarding/PersonalInfoForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

export default function PersonalInfoPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-[#2ea3f2]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#002168]">Personal Information</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-500">
            Tell us about yourself. This information will be used for your profile and 1099 tax documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}
