'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { TimeClock, TimeEntryList } from '@/components/features/time-tracking';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSubcontractorId } from '@/hooks/useSubcontractorId';

export default function SubcontractorTimePage() {
  const { profile } = useAuth();
  const { subcontractorId } = useSubcontractorId(profile?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Clock in and clock out with GPS verification for compliant field time entries."
      />
      <TimeClock />
      <TimeEntryList
        mode="subcontractor"
        subcontractorId={subcontractorId}
      />
    </div>
  );
}
