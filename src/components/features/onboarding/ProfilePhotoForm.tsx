'use client';

import { useState, useRef } from 'react';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Camera, Upload, X, CheckCircle } from 'lucide-react';

export function ProfilePhotoForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [photo, setPhoto] = useState<File | null>(data.profilePhoto || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!photo) return;
    setIsSubmitting(true);
    try {
      updateData({ profilePhoto: photo || undefined });
      await saveDraft();
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      updateData({ profilePhoto: photo || undefined });
      await saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-grid-danger text-white hover:opacity-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-grid-success">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Photo uploaded successfully</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-[var(--grid-gray-100)] rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-12 h-12 text-grid-subtle" />
            </div>
            <div>
              <p className="text-grid-body">Upload a clear photo of yourself</p>
              <p className="text-sm text-grid-subtle mt-1">
                JPG, PNG, or GIF • Max 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-grid-storm-50">
        <h4 className="font-medium mb-3">Photo Requirements:</h4>
        <ul className="text-sm text-grid-body space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-grid-success" />
            Clear, well-lit photo of your face
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-grid-success" />
            Neutral background (white or light gray)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-grid-success" />
            No hats, sunglasses, or face coverings
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-grid-success" />
            Professional appearance
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-grid-success" />
            Square or circular crop preferred
          </li>
        </ul>
      </Card>

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
          disabled={!photo || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Continuing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
