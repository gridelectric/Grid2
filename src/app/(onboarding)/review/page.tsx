'use client';

import { useSearchParams } from 'next/navigation';
import { ReviewForm } from '@/components/features/onboarding/ReviewForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardCheck, CheckCircle } from 'lucide-react';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const onboardingRequired = searchParams.get('reason') === 'onboarding-required';

  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-grid-storm-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-grid-storm-50 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-grid-blue" />
            </div>
            <div>
              <CardTitle className="text-xl text-grid-navy">Review Your Information</CardTitle>
            </div>
          </div>
          <CardDescription className="text-grid-muted">
            Please review all your information before submitting for approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {onboardingRequired && (
            <Alert variant="destructive">
              <AlertDescription>
                Your onboarding is not yet verified. Resolve required onboarding items to access storm event features.
              </AlertDescription>
            </Alert>
          )}

          <Alert className="bg-emerald-50 border-emerald-100">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-grid-muted">
              You&apos;re almost done! Review your information and submit your application. We&apos;ll review it within 24-48 hours.
            </AlertDescription>
          </Alert>
          
          <ReviewForm />
        </CardContent>
      </Card>
    </div>
  );
}
