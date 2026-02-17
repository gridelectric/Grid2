'use client';

import { ProfilePhotoForm } from '@/components/features/onboarding/ProfilePhotoForm';
import { OnboardingStepIndicator } from '@/components/features/onboarding/OnboardingProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Info } from 'lucide-react';

export default function ProfilePhotoPage() {
  return (
    <div className="space-y-6">
      <OnboardingStepIndicator />
      
      <Card className="border-grid-storm-100 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-grid-storm-50 flex items-center justify-center">
              <Camera className="w-5 h-5 text-grid-blue" />
            </div>
            <div>
              <CardTitle className="text-xl text-grid-navy">Profile Photo</CardTitle>
            </div>
          </div>
          <CardDescription className="text-grid-muted">
            Upload a professional photo for your contractor profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-grid-storm-50 border-grid-storm-100">
            <Info className="h-4 w-4 text-grid-muted" />
            <AlertDescription className="text-grid-muted">
              Use a clear, professional headshot. This photo will be visible to dispatchers when assigning work.
            </AlertDescription>
          </Alert>
          
          <ProfilePhotoForm />
        </CardContent>
      </Card>
    </div>
  );
}
