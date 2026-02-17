'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Lock } from 'lucide-react';

const bankingSchema = z
  .object({
    accountHolderName: z.string().min(1, 'Account holder name is required'),
    bankName: z.string().optional(),
    accountType: z.enum(['checking', 'savings']),
    routingNumber: z.string().length(9, 'Routing number must be 9 digits'),
    accountNumber: z.string().min(4, 'Account number is required'),
    confirmAccountNumber: z.string(),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers don't match",
    path: ['confirmAccountNumber'],
  });

type BankingData = z.infer<typeof bankingSchema>;

export function BankingForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BankingData>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      accountHolderName: data.accountHolderName || '',
      bankName: data.bankName || '',
      accountType: data.accountType || 'checking',
      routingNumber: data.routingNumber || '',
      accountNumber: data.accountNumber || '',
      confirmAccountNumber: '',
    },
  });

  const accountType = watch('accountType');

  const onSubmit = async (formData: BankingData) => {
    setIsSubmitting(true);
    try {
      // Don't save confirmAccountNumber to persistent data
      const { confirmAccountNumber, ...dataToSave } = formData;
      updateData(dataToSave);
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
      <div className="flex items-center gap-2 text-sm text-grid-muted bg-grid-storm-50 p-3 rounded-lg">
        <Lock className="w-4 h-4" />
        <span>Your banking information is encrypted and secure</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountHolderName">Account Holder Name *</Label>
        <Input
          id="accountHolderName"
          placeholder="Full name on account"
          {...register('accountHolderName')}
        />
        {errors.accountHolderName && (
          <p className="text-sm text-grid-danger">
            {errors.accountHolderName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          placeholder="e.g., Chase Bank"
          {...register('bankName')}
        />
      </div>

      <div className="space-y-2">
        <Label>Account Type *</Label>
        <RadioGroup
          defaultValue={accountType}
          className="flex gap-4"
          {...register('accountType')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="checking" id="checking" />
            <Label htmlFor="checking" className="cursor-pointer">
              Checking
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="savings" id="savings" />
            <Label htmlFor="savings" className="cursor-pointer">
              Savings
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="routingNumber">Routing Number *</Label>
        <Input
          id="routingNumber"
          type="password"
          placeholder="9 digits"
          maxLength={9}
          {...register('routingNumber')}
        />
        {errors.routingNumber && (
          <p className="text-sm text-grid-danger">{errors.routingNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number *</Label>
        <Input
          id="accountNumber"
          type="password"
          placeholder="Your account number"
          {...register('accountNumber')}
        />
        {errors.accountNumber && (
          <p className="text-sm text-grid-danger">{errors.accountNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
        <Input
          id="confirmAccountNumber"
          type="password"
          placeholder="Re-enter account number"
          {...register('confirmAccountNumber')}
        />
        {errors.confirmAccountNumber && (
          <p className="text-sm text-grid-danger">
            {errors.confirmAccountNumber.message}
          </p>
        )}
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
          type="submit"
          className="w-full sm:w-auto sm:ml-auto"
          disabled={isSubmitting}
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
    </form>
  );
}
