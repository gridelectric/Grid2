'use client';

import { useState } from 'react';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Edit } from 'lucide-react';

export function ReviewForm() {
  const { data, submitApplication, prevStep, saveDraft, goToStep } = useOnboarding();
  const [confirmed, setConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitApplication();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 1, title: 'Personal Information', step: 1, data: `${data.firstName} ${data.lastName}` },
    { id: 2, title: 'Business Information', step: 2, data: data.businessType },
    { id: 3, title: 'Insurance', step: 3, data: 'Documents uploaded' },
    { id: 4, title: 'Credentials', step: 4, data: data.licenseNumber ? `License: ${data.licenseNumber}` : 'No license provided' },
    { id: 5, title: 'Banking', step: 5, data: data.accountHolderName },
    { id: 6, title: 'Rates', step: 6, data: data.ratesAgreed ? 'Agreed' : 'Pending' },
    { id: 7, title: 'Agreements', step: 7, data: data.agreementsSigned ? 'Signed' : 'Pending' },
    { id: 8, title: 'Training', step: 8, data: data.trainingCompleted ? 'Completed' : 'Pending' },
    { id: 9, title: 'Profile Photo', step: 9, data: data.profilePhoto ? 'Uploaded' : 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{section.title}</h4>
                <p className="text-sm text-grid-muted">{section.data}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(section.step)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <Checkbox
            id="final-confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <div className="space-y-1">
            <Label htmlFor="final-confirm" className="font-medium cursor-pointer">
              I confirm that all information is accurate
            </Label>
            <p className="text-sm text-grid-body">
              I understand that providing false information may result in
              termination of my contractor agreement and potential legal action.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Draft'
          )}
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto sm:ml-auto"
          disabled={!confirmed || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </div>
  );
}
