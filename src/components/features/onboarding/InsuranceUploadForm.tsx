'use client';

import { type ChangeEvent, useState } from 'react';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  uploadOnboardingComplianceDocuments,
  validateComplianceDocumentFile,
} from '@/lib/services/onboardingDocumentsService';
import { Loader2, Upload, File, X } from 'lucide-react';

type ComplianceDocumentKey = 'w9' | 'insurance';
type DocumentStatus = 'pending' | 'uploaded' | 'failed';

interface ComplianceDocumentState {
  file?: File;
  status: DocumentStatus;
  error?: string;
}

const STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'Pending',
  uploaded: 'Uploaded',
  failed: 'Failed',
};

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: 'bg-[var(--grid-gray-100)] text-grid-body',
  uploaded: 'bg-grid-success-soft text-grid-success',
  failed: 'bg-grid-danger-soft text-grid-danger',
};

export function InsuranceUploadForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();

  const [documents, setDocuments] = useState<Record<ComplianceDocumentKey, ComplianceDocumentState>>({
    w9: {
      file: data.complianceDocuments?.w9File,
      status: data.complianceDocuments?.uploadStatus?.w9 ?? 'pending',
    },
    insurance: {
      file: data.complianceDocuments?.insuranceFile,
      status: data.complianceDocuments?.uploadStatus?.insurance ?? 'pending',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileChange = (
    documentType: ComplianceDocumentKey,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateComplianceDocumentFile(file);
    if (validationError) {
      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          status: 'failed',
          error: validationError,
        },
      }));
      return;
    }

    setSubmitError(null);
    setDocuments((prev) => ({
      ...prev,
      [documentType]: {
        file,
        status: 'pending',
      },
    }));
  };

  const handleRemoveFile = (documentType: ComplianceDocumentKey) => {
    setDocuments((prev) => ({
      ...prev,
      [documentType]: {
        status: 'pending',
      },
    }));
  };

  const saveDocumentDraft = async () => {
    updateData({
      complianceDocuments: {
        w9File: documents.w9.file,
        insuranceFile: documents.insurance.file,
        uploadStatus: {
          w9: documents.w9.status,
          insurance: documents.insurance.status,
        },
      },
    });
    await saveDraft();
  };

  const handleSubmit = async () => {
    if (!documents.w9.file || !documents.insurance.file) {
      setSubmitError('Upload both required documents: W-9 and insurance. Accepted formats: PDF, JPEG, PNG, WEBP.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await uploadOnboardingComplianceDocuments({
        w9File: documents.w9.file,
        insuranceFile: documents.insurance.file,
      });

      setDocuments((prev) => ({
        w9: {
          ...prev.w9,
          status: result.w9.status,
          error: result.w9.message,
        },
        insurance: {
          ...prev.insurance,
          status: result.insurance.status,
          error: result.insurance.message,
        },
      }));

      if (result.w9.status === 'failed' || result.insurance.status === 'failed') {
        setSubmitError(
          result.w9.message
          || result.insurance.message
          || 'One or more required documents failed to upload. Please correct and retry.'
        );
        return;
      }

      await saveDocumentDraft();
      nextStep();
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Unable to upload compliance documents right now. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveDocumentDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const renderFileUpload = (
    documentType: ComplianceDocumentKey,
    label: string,
    description: string
  ) => {
    const documentState = documents[documentType];
    const statusLabel = STATUS_LABELS[documentState.status];
    const statusStyle = STATUS_STYLES[documentState.status];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>
            {label} <span className="text-grid-danger">*</span>
          </Label>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-grid-muted">
          {description}
        </p>
        {documentState.file ? (
          <div className="flex items-center gap-2 rounded-lg bg-grid-storm-50 p-3">
            <File className="h-5 w-5 text-grid-blue" />
            <span className="flex-1 truncate text-sm">{documentState.file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(documentType)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange(documentType, event)}
              className="cursor-pointer"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-grid-storm-50 border rounded-md">
              <div className="flex items-center gap-2 text-grid-muted">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload {label}</span>
              </div>
            </div>
          </div>
        )}

        {documentState.error && (
          <p className="text-sm text-grid-danger">{documentState.error}</p>
        )}
      </div>
    );
  };

  const isValid = !!documents.w9.file && !!documents.insurance.file;

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-grid-storm-100 bg-grid-storm-50">
        <AlertDescription className="text-grid-muted">
          Required documents: W-9 and insurance proof. Accepted formats: PDF, JPEG, PNG, WEBP. Maximum size: 10MB per file.
        </AlertDescription>
      </Alert>

      {renderFileUpload('w9', 'W-9 Document', 'Upload your completed W-9 form.')}
      {renderFileUpload('insurance', 'Insurance Proof', 'Upload current proof of insurance coverage.')}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Draft'
          )}
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto sm:ml-auto"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
