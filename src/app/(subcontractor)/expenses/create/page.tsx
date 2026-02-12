'use client';

import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { ExpenseForm } from '@/components/features/expenses';
import { useAuth } from '@/components/providers/AuthProvider';

export default function SubcontractorExpenseCreatePage() {
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Expense"
        description="Capture expense details and attach a receipt for review."
        showBackButton
        backHref="/subcontractor/expenses"
      />

      <ExpenseForm
        subcontractorId={profile?.id}
        onSaved={() => {
          router.push('/subcontractor/expenses');
        }}
      />
    </div>
  );
}
