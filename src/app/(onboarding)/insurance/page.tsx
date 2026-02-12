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
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#2ea3f2]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#002168]">Compliance Documents</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-500">
            Upload your required W-9 and insurance documents so we can verify onboarding eligibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-100">
            <Info className="h-4 w-4 text-[#2ea3f2]" />
            <AlertDescription className="text-gray-600">
              Your compliance documents are encrypted and securely stored. We verify submissions before approving your account.
            </AlertDescription>
          </Alert>
          
          <InsuranceUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
