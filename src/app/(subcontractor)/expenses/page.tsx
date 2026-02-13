'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { ExpenseList } from '@/components/features/expenses';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSubcontractorId } from '@/hooks/useSubcontractorId';

export default function SubcontractorExpensesPage() {
  const { profile } = useAuth();
  const { subcontractorId } = useSubcontractorId(profile?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and submit reimbursable expenses with receipt attachments."
      />

      <ExpenseList subcontractorId={subcontractorId} />
    </div>
  );
}
