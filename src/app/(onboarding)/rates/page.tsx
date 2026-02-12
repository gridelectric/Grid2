'use client';

import { RatesForm } from '@/components/features/onboarding/RatesForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function RatesPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#2ea3f2]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#002168]">Rate Agreement</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-500">
            Review our standard rates for different types of work assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RatesForm />
        </CardContent>
      </Card>
    </div>
  );
}
