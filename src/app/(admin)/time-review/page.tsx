'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { TimeEntryList } from '@/components/features/time-tracking';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminTimeReviewPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Entry Review"
        description="Review pending field time entries, apply batch decisions, and verify billable totals."
      />

      <div className="storm-surface rounded-xl p-4">
        <TimeEntryList
          mode="admin"
          reviewerId={profile?.id}
        />
      </div>
    </div>
  );
}
