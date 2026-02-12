'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { StatusBadge } from '@/components/common/data-display/StatusBadge';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User,
  Loader2,
} from 'lucide-react';
import {
  type OnboardingReviewPackage,
  getPendingOnboardingPackages,
  setOnboardingVerificationDecision,
} from '@/lib/services/onboardingReviewService';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export default function SubcontractorApprovalPage() {
  const { profile } = useAuth();
  const [packages, setPackages] = useState<OnboardingReviewPackage[]>([]);
  const [selectedSubcontractorId, setSelectedSubcontractorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = useMemo(
    () => packages.find((item) => item.subcontractorId === selectedSubcontractorId) ?? null,
    [packages, selectedSubcontractorId]
  );

  const canVerify = profile?.role === 'SUPER_ADMIN';

  const loadPackages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pendingPackages = await getPendingOnboardingPackages();
      setPackages(pendingPackages);
      setSelectedSubcontractorId((previousSelection) => {
        if (previousSelection && pendingPackages.some((item) => item.subcontractorId === previousSelection)) {
          return previousSelection;
        }
        return pendingPackages[0]?.subcontractorId ?? null;
      });
    } catch (loadError) {
      if (loadError instanceof Error) {
        setError(loadError.message);
      } else {
        setError('Unable to load onboarding submissions.');
      }
      setPackages([]);
      setSelectedSubcontractorId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPackages();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleApprove = async () => {
    if (!selectedPackage) {
      return;
    }

    setIsApproving(true);
    setError(null);
    try {
      await setOnboardingVerificationDecision({
        subcontractorId: selectedPackage.subcontractorId,
        decision: 'verified',
      });
      await loadPackages();
    } catch (actionError) {
      if (actionError instanceof Error) {
        setError(actionError.message);
      } else {
        setError('Unable to mark onboarding as verified.');
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPackage) {
      return;
    }

    setIsRejecting(true);
    setError(null);
    try {
      await setOnboardingVerificationDecision({
        subcontractorId: selectedPackage.subcontractorId,
        decision: 'not_verified',
      });
      await loadPackages();
    } catch (actionError) {
      if (actionError instanceof Error) {
        setError(actionError.message);
      } else {
        setError('Unable to mark onboarding as not verified.');
      }
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcontractor Approvals"
        description={`${packages.length} applications pending review`}
        showBackButton
        backHref="/admin/subcontractors"
      />

      {!canVerify && (
        <Alert>
          <AlertDescription>
            Only Super Admin can finalize onboarding verification decisions.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && (
              <div className="flex items-center justify-center p-8 text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading submissions...
              </div>
            )}

            {!isLoading && packages.length === 0 && (
              <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                No pending onboarding packages.
              </div>
            )}

            {packages.map((submission) => (
              <button
                key={submission.subcontractorId}
                onClick={() => setSelectedSubcontractorId(submission.subcontractorId)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedPackage?.subcontractorId === submission.subcontractorId
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {getInitials(submission.profile.firstName, submission.profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {submission.profile.firstName} {submission.profile.lastName}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{submission.profile.email}</p>
                </div>
                <Badge variant="outline">{formatDate(submission.submittedAt)}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Detail View */}
        {selectedPackage && (
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                        {getInitials(selectedPackage.profile.firstName, selectedPackage.profile.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {selectedPackage.profile.firstName} {selectedPackage.profile.lastName}
                      </CardTitle>
                      <p className="text-slate-500">{selectedPackage.profile.email}</p>
                      <p className="text-sm text-slate-400">
                        Submitted: {formatDate(selectedPackage.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={!canVerify || isRejecting || isApproving}
                    >
                      {isRejecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Mark Not Verified
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={!canVerify || isApproving || isRejecting}
                    >
                      {isApproving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Mark Verified
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="font-medium">{selectedPackage.profile.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-500">Emergency Contact</p>
                        <p className="font-medium">
                          {selectedPackage.profile.emergencyContactName || 'Not provided'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedPackage.profile.emergencyContactPhone || 'No emergency phone'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700">Required Documents</h3>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">W-9</p>
                          <p className="text-xs text-slate-500">
                            {selectedPackage.documents.w9.fileName || 'Missing file'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        status={selectedPackage.documents.w9.status === 'uploaded' ? 'Verified' : 'Pending'}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Insurance</p>
                          <p className="text-xs text-slate-500">
                            {selectedPackage.documents.insurance.fileName || 'Missing file'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        status={selectedPackage.documents.insurance.status === 'uploaded' ? 'Verified' : 'Pending'}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
