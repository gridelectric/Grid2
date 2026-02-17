'use client';

import { TrainingForm } from '@/components/features/onboarding/TrainingForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, PlayCircle } from 'lucide-react';

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-grid-storm-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-grid-storm-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-grid-blue" />
            </div>
            <div>
              <CardTitle className="text-xl text-grid-navy">Safety Training</CardTitle>
            </div>
          </div>
          <CardDescription className="text-grid-muted">
            Complete required safety training to ensure you&apos;re prepared for field work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-grid-storm-50 border-grid-storm-100">
            <PlayCircle className="h-4 w-4 text-grid-blue" />
            <AlertDescription className="text-grid-muted">
              Watch the safety training video and complete the quiz to proceed. This training is mandatory for all contractors.
            </AlertDescription>
          </Alert>
          
          <TrainingForm />
        </CardContent>
      </Card>
    </div>
  );
}
