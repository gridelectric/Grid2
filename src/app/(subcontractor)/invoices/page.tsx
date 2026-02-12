'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { InvoiceList } from '@/components/features/invoices';
import { useAuth } from '@/components/providers/AuthProvider';

export default function SubcontractorInvoicesPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Review generated invoices, payment status, and 1099 tracking."
      />

      <InvoiceList subcontractorId={profile?.id} />
    </div>
  );
}
