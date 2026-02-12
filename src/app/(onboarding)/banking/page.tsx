'use client';

import { BankingForm } from '@/components/features/onboarding/BankingForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Landmark, Lock } from 'lucide-react';

export default function BankingPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-[#2ea3f2]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#002168]">Banking Information</CardTitle>
            </div>
          </div>
          <CardDescription className="text-gray-500">
            Set up direct deposit for your payments. Your information is encrypted and secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-emerald-50 border-emerald-100">
            <Lock className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-gray-600">
              Your banking information is encrypted using bank-level security. We never store your full account details.
            </AlertDescription>
          </Alert>
          
          <BankingForm />
        </CardContent>
      </Card>
    </div>
  );
}
