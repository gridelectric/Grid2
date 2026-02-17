'use client';

import { useState } from 'react';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const DEFAULT_RATES = [
  { type: 'Standard Assessment', rate: 75.0, description: 'Regular damage assessments' },
  { type: 'Emergency Response', rate: 125.0, description: 'After-hours emergency calls' },
  { type: 'Travel Time', rate: 37.5, description: 'Travel to/from site (50% of standard)' },
  { type: 'Standby', rate: 25.0, description: 'On-call standby time' },
  { type: 'Training', rate: 50.0, description: 'Required training sessions' },
  { type: 'Admin', rate: 50.0, description: 'Administrative tasks' },
];

export function RatesForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [agreed, setAgreed] = useState(data.ratesAgreed || false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      updateData({ ratesAgreed: agreed });
      await saveDraft();
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      updateData({ ratesAgreed: agreed });
      await saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {DEFAULT_RATES.map((rate) => (
          <Card key={rate.type} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{rate.type}</h4>
                <p className="text-sm text-grid-muted">{rate.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-grid-blue">
                  ${rate.rate.toFixed(2)}
                </p>
                <p className="text-xs text-grid-subtle">per hour</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-grid-storm-50">
        <h4 className="font-medium mb-2">Expense Reimbursement</h4>
        <ul className="text-sm text-grid-body space-y-1">
          <li>• Mileage: $0.655/mile (current IRS rate)</li>
          <li>• Tolls and parking: Full reimbursement with receipt</li>
          <li>• Lodging: Up to $150/night when pre-approved</li>
          <li>• Meals: Up to $75/day when overnight travel required</li>
        </ul>
      </Card>

      <div className="flex items-start gap-3 p-4 border rounded-lg">
        <Checkbox
          id="rates-agreement"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked as boolean)}
        />
        <div className="space-y-1">
          <Label htmlFor="rates-agreement" className="font-medium cursor-pointer">
            I agree to the compensation rates
          </Label>
          <p className="text-sm text-grid-muted">
            I understand these rates are for new contractors and may be adjusted
            based on performance after 90 days.
          </p>
        </div>
      </div>

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
          disabled={!agreed || isSubmitting}
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
