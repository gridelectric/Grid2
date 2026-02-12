'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { TimeClock, TimeEntryList } from '@/components/features/time-tracking';
import { useAuth } from '@/components/providers/AuthProvider';

export default function SubcontractorTimePage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Clock in and clock out with GPS verification for compliant field time entries."
      />
      <TimeClock />
      <TimeEntryList
        mode="subcontractor"
        subcontractorId={profile?.id}
      />
    </div>
  );
}
