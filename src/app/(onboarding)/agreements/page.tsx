'use client';

import { AgreementsForm } from '@/components/features/onboarding/AgreementsForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Scale } from 'lucide-react';

export default function AgreementsPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-grid-storm-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-grid-storm-50 flex items-center justify-center">
              <Scale className="w-5 h-5 text-grid-blue" />
            </div>
            <div>
              <CardTitle className="text-xl text-grid-navy">Agreements & Contracts</CardTitle>
            </div>
          </div>
          <CardDescription className="text-grid-muted">
            Please review and sign the following documents to complete your contractor agreement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-grid-warning-soft border-grid-warning">
            <FileText className="h-4 w-4 text-grid-warning" />
            <AlertDescription className="text-grid-muted">
              These are legally binding documents. Please read each agreement carefully before signing.
            </AlertDescription>
          </Alert>
          
          <AgreementsForm />
        </CardContent>
      </Card>
    </div>
  );
}
