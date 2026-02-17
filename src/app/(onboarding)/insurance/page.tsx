'use client';

import { InsuranceUploadForm } from '@/components/features/onboarding/InsuranceUploadForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

export default function InsurancePage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-grid-storm-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-grid-storm-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-grid-blue" />
            </div>
            <div>
              <CardTitle className="text-xl text-grid-navy">Compliance Documents</CardTitle>
            </div>
          </div>
          <CardDescription className="text-grid-muted">
            Upload your required W-9 and insurance documents so we can verify onboarding eligibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-grid-storm-50 border-grid-storm-100">
            <Info className="h-4 w-4 text-grid-blue" />
            <AlertDescription className="text-grid-muted">
              Your compliance documents are encrypted and securely stored. We verify submissions before approving your account.
            </AlertDescription>
          </Alert>
          
          <InsuranceUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
