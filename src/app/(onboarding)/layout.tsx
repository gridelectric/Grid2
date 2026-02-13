import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  void children;
  redirect('/login?reason=onboarding-removed');
}
