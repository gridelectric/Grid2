'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  submitCoreOnboardingProfile,
  ONBOARDING_ALREADY_VERIFIED_ERROR,
  ONBOARDING_AUTH_REQUIRED_ERROR,
  ONBOARDING_PERMISSION_ERROR,
} from '@/lib/services/onboardingService';
import { coreOnboardingProfileSchema, type CoreOnboardingProfileInput } from '@/lib/schemas/onboarding';
import { Loader2, ArrowRight, Save } from 'lucide-react';

export function PersonalInfoForm() {
  const { data, updateData, nextStep, saveDraft } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CoreOnboardingProfileInput>({
    resolver: zodResolver(coreOnboardingProfileSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
    },
  });

  const onSubmit = async (formData: CoreOnboardingProfileInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      updateData(formData);
      await submitCoreOnboardingProfile(formData);
      await saveDraft();
      nextStep();
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === ONBOARDING_AUTH_REQUIRED_ERROR
          || error.message === ONBOARDING_PERMISSION_ERROR
          || error.message === ONBOARDING_ALREADY_VERIFIED_ERROR
        ) {
          setSubmitError(error.message);
          return;
        }

        setSubmitError('Unable to submit onboarding profile right now. Please try again.');
        return;
      }

      setSubmitError('Unable to submit onboarding profile right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      updateData(getValues());
      await saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-grid-body font-medium">
            First Name <span className="text-grid-danger">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="text-sm text-grid-danger flex items-center gap-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-grid-body font-medium">
            Last Name <span className="text-grid-danger">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Smith"
            className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="text-sm text-grid-danger">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-grid-body font-medium">
          Email Address <span className="text-grid-danger">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john.smith@example.com"
          className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-grid-danger">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-grid-body font-medium">
          Phone Number <span className="text-grid-danger">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-grid-danger">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName" className="text-grid-body font-medium">
            Emergency Contact Name <span className="text-grid-danger">*</span>
          </Label>
          <Input
            id="emergencyContactName"
            placeholder="Emergency contact full name"
            className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
            {...register('emergencyContactName')}
          />
          {errors.emergencyContactName && (
            <p className="text-sm text-grid-danger">{errors.emergencyContactName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContactPhone" className="text-grid-body font-medium">
            Emergency Contact Phone <span className="text-grid-danger">*</span>
          </Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            placeholder="(555) 987-6543"
            className="h-11 border-[var(--grid-gray-200)] focus:border-grid-blue focus:ring-grid-blue/20"
            {...register('emergencyContactPhone')}
          />
          {errors.emergencyContactPhone && (
            <p className="text-sm text-grid-danger">{errors.emergencyContactPhone.message}</p>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="bg-grid-storm-50 border-grid-storm-100">
        <AlertDescription className="text-sm text-grid-muted">
          This information will be used for your 1099 tax documents and cannot be changed after submission without contacting support.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
