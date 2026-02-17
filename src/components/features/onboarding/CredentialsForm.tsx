'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, Save, Upload } from 'lucide-react';

const credentialsSchema = z.object({
  licenseNumber: z.string().optional(),
  certifications: z.string().optional(),
  yearsExperience: z.string().optional(),
  specialties: z.string().optional(),
});

type CredentialsData = z.infer<typeof credentialsSchema>;

export function CredentialsForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      licenseNumber: data.licenseNumber || '',
      certifications: data.certifications || '',
      yearsExperience: data.yearsExperience || '',
      specialties: data.specialties || '',
    },
  });

  const onSubmit = async (formData: CredentialsData) => {
    setIsSubmitting(true);
    try {
      updateData(formData);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="licenseNumber" className="text-grid-body font-medium">
          Professional License Number
        </Label>
        <Input
          id="licenseNumber"
          placeholder="e.g., EL-12345"
          className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
          {...register('licenseNumber')}
        />
        <p className="text-xs text-grid-muted">If applicable to your trade</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="certifications" className="text-grid-body font-medium">
          Certifications
        </Label>
        <Textarea
          id="certifications"
          placeholder="List any relevant certifications (e.g., OSHA 30, First Aid, etc.)"
          className="min-h-[100px] border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
          {...register('certifications')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsExperience" className="text-grid-body font-medium">
          Years of Experience
        </Label>
        <Input
          id="yearsExperience"
          type="number"
          placeholder="e.g., 5"
          className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
          {...register('yearsExperience')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialties" className="text-grid-body font-medium">
          Areas of Specialization
        </Label>
        <Textarea
          id="specialties"
          placeholder="Describe your areas of expertise (e.g., residential, commercial, industrial, etc.)"
          className="min-h-[100px] border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
          {...register('specialties')}
        />
      </div>

      {/* Document Upload Placeholder */}
      <div className="border-2 border-dashed border-[var(--grid-gray-200)] rounded-lg p-8 text-center hover:border-grid-blue transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-grid-storm-50 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6 text-grid-blue" />
        </div>
        <p className="text-sm font-medium text-grid-body">Upload certifications</p>
        <p className="text-xs text-grid-muted mt-1">PDF, JPG, or PNG up to 10MB</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto h-11 px-6 border-[var(--grid-gray-300)] hover:bg-grid-storm-50"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto h-11 px-6 border-[var(--grid-gray-300)] hover:bg-grid-storm-50 hover:border-[var(--grid-gray-400)]"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </>
          )}
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto sm:ml-auto h-11 px-6 bg-gradient-to-r from-grid-navy to-grid-blue hover:from-[var(--grid-navy-dark)] hover:to-[var(--grid-blue-dark)] shadow-md shadow-[rgba(46,163,242,0.28)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Continuing...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
