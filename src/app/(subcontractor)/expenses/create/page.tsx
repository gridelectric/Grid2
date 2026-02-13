'use client';

import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { ExpenseForm } from '@/components/features/expenses';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSubcontractorId } from '@/hooks/useSubcontractorId';

export default function SubcontractorExpenseCreatePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { subcontractorId } = useSubcontractorId(profile?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Expense"
        description="Capture expense details and attach a receipt for review."
        showBackButton
        backHref="/contractor/expenses"
      />

      <ExpenseForm
        subcontractorId={subcontractorId}
        onSaved={() => {
          router.push('/contractor/expenses');
        }}
      />
    </div>
  );
}
