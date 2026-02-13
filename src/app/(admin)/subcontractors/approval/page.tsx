import { redirect } from 'next/navigation';

export default function ContractorApprovalDeprecatedPage() {
  redirect('/forbidden?reason=onboarding-removed');
}
