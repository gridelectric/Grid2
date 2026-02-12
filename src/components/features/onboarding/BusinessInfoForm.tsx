'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const businessInfoSchema = z.object({
  businessType: z.string().min(1, 'Business type is required'),
  businessName: z.string().optional(),
  taxId: z.string().min(9, 'Tax ID or SSN is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
});

type BusinessInfoData = z.infer<typeof businessInfoSchema>;

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'llc', label: 'LLC' },
  { value: 's_corporation', label: 'S Corporation' },
  { value: 'c_corporation', label: 'C Corporation' },
  { value: 'partnership', label: 'Partnership' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export function BusinessInfoForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessType: data.businessType || '',
      businessName: data.businessName || '',
      taxId: data.taxId || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zipCode || '',
    },
  });

  const businessType = watch('businessType');
  const state = watch('state');

  const onSubmit = async (formData: BusinessInfoData) => {
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
        <Label htmlFor="businessType">Business Structure *</Label>
        <Select
          value={businessType}
          onValueChange={(value) => setValue('businessType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.businessType && (
          <p className="text-sm text-red-600">{errors.businessType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">
          Business Name {businessType !== 'sole_proprietorship' && '(if applicable)'}
        </Label>
        <Input
          id="businessName"
          placeholder="Smith Electrical Services LLC"
          {...register('businessName')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxId">EIN or SSN for 1099 *</Label>
        <Input
          id="taxId"
          type="password"
          placeholder="XX-XXXXXXX"
          {...register('taxId')}
        />
        {errors.taxId && (
          <p className="text-sm text-red-600">{errors.taxId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Street Address *</Label>
        <Input
          id="addressLine1"
          placeholder="123 Main Street"
          {...register('addressLine1')}
        />
        {errors.addressLine1 && (
          <p className="text-sm text-red-600">{errors.addressLine1.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Apt, Suite, etc. (optional)</Label>
        <Input
          id="addressLine2"
          placeholder="Suite 100"
          {...register('addressLine2')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="City"
            {...register('city')}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select
            value={state}
            onValueChange={(value) => setValue('state', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((stateCode) => (
                <SelectItem key={stateCode} value={stateCode}>
                  {stateCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">ZIP Code *</Label>
        <Input
          id="zipCode"
          placeholder="12345"
          {...register('zipCode')}
        />
        {errors.zipCode && (
          <p className="text-sm text-red-600">{errors.zipCode.message}</p>
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
