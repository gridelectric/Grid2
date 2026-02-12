'use client';

import { usePathname } from 'next/navigation';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Check } from 'lucide-react';

const ONBOARDING_STEPS = [
  { path: '/welcome', label: 'Welcome', step: 0 },
  { path: '/personal-info', label: 'Personal', step: 1 },
  { path: '/business-info', label: 'Business', step: 2 },
  { path: '/insurance', label: 'Insurance', step: 3 },
  { path: '/credentials', label: 'Credentials', step: 4 },
  { path: '/banking', label: 'Banking', step: 5 },
  { path: '/rates', label: 'Rates', step: 6 },
  { path: '/agreements', label: 'Agreements', step: 7 },
  { path: '/training', label: 'Training', step: 8 },
  { path: '/profile-photo', label: 'Photo', step: 9 },
  { path: '/review', label: 'Review', step: 10 },
  { path: '/pending', label: 'Pending', step: 11 },
];

export function OnboardingProgress() {
  const pathname = usePathname();
  const { currentStep, totalSteps } = useOnboarding();

  // Don't show progress on welcome or pending pages
  if (pathname === '/welcome' || pathname === '/pending') {
    return null;
  }

  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500 font-medium hidden sm:block">
        Step {currentStep} of {totalSteps - 1}
      </span>
      <div className="w-32 sm:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2ea3f2 0%, #0693e3 100%)'
          }}
        />
      </div>
    </div>
  );
}

export function OnboardingStepIndicator() {
  const pathname = usePathname();
  const currentStepInfo = ONBOARDING_STEPS.find(s => s.path === pathname);
  
  if (!currentStepInfo || currentStepInfo.step === 0 || currentStepInfo.step === 11) {
    return null;
  }

  return (
    <div className="flex justify-center gap-2 mb-8">
      {ONBOARDING_STEPS.slice(1, 11).map((step, index) => {
        const isActive = step.step === currentStepInfo.step;
        const isCompleted = step.step < currentStepInfo.step;
        
        return (
          <div
            key={step.path}
            className={`
              relative flex items-center justify-center rounded-full transition-all duration-300
              ${isActive 
                ? 'w-8 h-8 bg-gradient-to-br from-[#2ea3f2] to-[#0693e3] text-white shadow-lg shadow-blue-200' 
                : isCompleted
                ? 'w-6 h-6 bg-[#2ea3f2] text-white'
                : 'w-6 h-6 bg-gray-200 text-gray-400'
              }
            `}
          >
            {isCompleted && !isActive ? (
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            ) : isActive ? (
              <span className="text-sm font-semibold">{step.step}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function OnboardingStepList() {
  const pathname = usePathname();
  const currentStepInfo = ONBOARDING_STEPS.find(s => s.path === pathname);
  
  if (!currentStepInfo || currentStepInfo.step === 0 || currentStepInfo.step === 11) {
    return null;
  }

  return (
    <div className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-[#002168] mb-4">Onboarding Steps</h3>
        <nav className="space-y-1">
          {ONBOARDING_STEPS.slice(1, 11).map((step) => {
            const isActive = step.step === currentStepInfo.step;
            const isCompleted = step.step < currentStepInfo.step;
            const isPending = step.step > currentStepInfo.step;
            
            return (
              <div
                key={step.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-transparent text-[#2ea3f2] font-medium' 
                    : isCompleted
                    ? 'text-gray-700'
                    : 'text-gray-400'
                  }
                `}
              >
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${isActive 
                      ? 'bg-[#2ea3f2] text-white' 
                      : isCompleted
                      ? 'bg-[#2ea3f2] text-white'
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    step.step
                  )}
                </div>
                <span>{step.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
