'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface OnboardingData {
  // Personal Info
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Business Info
  businessType?: string;
  businessName?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  // Credentials
  licenseNumber?: string;
  certifications?: string;
  yearsExperience?: string;
  specialties?: string;

  // Insurance
  insuranceFiles?: {
    generalLiability?: { file: File; coverage?: string; expirationDate?: string };
    workersComp?: { file: File; coverage?: string; expirationDate?: string };
    autoInsurance?: { file: File; coverage?: string; expirationDate?: string };
    umbrella?: { file: File; coverage?: string; expirationDate?: string };
  };
  complianceDocuments?: {
    w9File?: File;
    insuranceFile?: File;
    uploadStatus?: {
      w9: 'pending' | 'uploaded' | 'failed';
      insurance: 'pending' | 'uploaded' | 'failed';
    };
  };

  // Banking
  accountHolderName?: string;
  bankName?: string;
  accountType?: 'checking' | 'savings';
  routingNumber?: string;
  accountNumber?: string;

  // Rates (agreed to default rates)
  ratesAgreed?: boolean;

  // Agreements
  agreementsSigned?: boolean;

  // Training
  trainingCompleted?: boolean;
  trainingVideosCompleted?: boolean[];

  // Profile Photo
  profilePhoto?: File;
}

interface OnboardingContextType {
  data: OnboardingData;
  currentStep: number;
  totalSteps: number;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  saveDraft: () => Promise<void>;
  submitApplication: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS = [
  '/welcome',
  '/personal-info',
  '/business-info',
  '/insurance',
  '/banking',
  '/rates',
  '/agreements',
  '/training',
  '/profile-photo',
  '/review',
  '/pending',
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<OnboardingData>({});
  const currentStep = Math.max(ONBOARDING_STEPS.findIndex(step => step === pathname), 0);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const nextStep = useCallback(() => {
    const nextIndex = currentStep + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      router.push(ONBOARDING_STEPS[nextIndex]);
    }
  }, [currentStep, router]);

  const prevStep = useCallback(() => {
    const prevIndex = currentStep - 1;
    if (prevIndex >= 0) {
      router.push(ONBOARDING_STEPS[prevIndex]);
    }
  }, [currentStep, router]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < ONBOARDING_STEPS.length) {
      router.push(ONBOARDING_STEPS[step]);
    }
  }, [router]);

  const saveDraft = useCallback(async () => {
    // In a real implementation, this would save to localStorage or IndexedDB
    // For now, we'll just log it
    console.log('Saving draft:', data);

    // Could also save to Supabase if user is logged in
    // await supabase.from('onboarding_drafts').upsert({ ... })
  }, [data]);

  const submitApplication = useCallback(async () => {
    // This would submit the complete onboarding data
    console.log('Submitting application:', data);

    // Navigate to pending page
    router.push('/pending');
  }, [data, router]);

  const value = {
    data,
    currentStep,
    totalSteps: ONBOARDING_STEPS.length,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    saveDraft,
    submitApplication,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
