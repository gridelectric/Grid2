'use client';

import { RatesForm } from '@/components/features/onboarding/RatesForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function RatesPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-grid-storm-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-grid-storm-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-grid-blue" />
            </div>
            <div>
              <CardTitle className="text-xl text-grid-navy">Rate Agreement</CardTitle>
            </div>
          </div>
          <CardDescription className="text-grid-muted">
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
