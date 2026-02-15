'use client';

import { PageHeader } from '@/components/common/layout/PageHeader';
import { AssessmentReviewList } from '@/components/features/assessments';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminAssessmentReviewPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Review"
        description="Review submitted damage assessments and approve or request rework."
      />

      <div className="storm-surface rounded-xl p-4">
        <AssessmentReviewList reviewerId={profile?.id} />
      </div>
    </div>
  );
}
