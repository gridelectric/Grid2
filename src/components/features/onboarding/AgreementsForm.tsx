'use client';

import { useState } from 'react';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, ExternalLink } from 'lucide-react';

const AGREEMENTS = [
  {
    id: 'independent-contractor',
    title: 'Independent Contractor Agreement',
    description:
      'Defines the relationship between you and Grid Electric as an independent contractor.',
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality & Non-Disclosure Agreement',
    description:
      'Protects sensitive utility infrastructure information and client data.',
  },
  {
    id: 'safety',
    title: 'Safety Protocol Acknowledgment',
    description:
      'Confirms you understand and will follow all safety procedures and PPE requirements.',
  },
  {
    id: 'data-privacy',
    title: 'Data Privacy & Security Agreement',
    description:
      'Covers handling of photos, assessment data, and personal information.',
  },
];

export function AgreementsForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [signedAgreements, setSignedAgreements] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      AGREEMENTS.forEach((a) => {
        initial[a.id] = false;
      });
      return initial;
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAgreementToggle = (id: string, checked: boolean) => {
    setSignedAgreements((prev) => ({ ...prev, [id]: checked }));
  };

  const allSigned = Object.values(signedAgreements).every(Boolean);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      updateData({ agreementsSigned: true });
      await saveDraft();
      nextStep();
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {AGREEMENTS.map((agreement) => (
          <Card key={agreement.id} className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                id={agreement.id}
                checked={signedAgreements[agreement.id]}
                onCheckedChange={(checked) =>
                  handleAgreementToggle(agreement.id, checked as boolean)
                }
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-grid-subtle" />
                  <Label
                    htmlFor={agreement.id}
                    className="font-medium cursor-pointer"
                  >
                    {agreement.title}
                  </Label>
                </div>
                <p className="text-sm text-grid-muted mt-1">
                  {agreement.description}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2"
                  onClick={() => {
                    // In a real app, this would open the agreement PDF
                    alert(`View ${agreement.title}`);
                  }}
                >
                  View Document
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> These are legally binding agreements. By
          checking each box, you acknowledge that you have read, understood, and
          agree to the terms. Electronic signatures are legally valid under the
          ESIGN Act.
        </p>
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
          disabled={!allSigned || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Continuing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
