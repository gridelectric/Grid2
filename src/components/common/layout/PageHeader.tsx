'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  showBackButton?: boolean;
  backHref?: string;
}

export function PageHeader({
  title,
  description,
  children,
  showBackButton = false,
  backHref,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="storm-surface mb-6 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 -ml-2 min-h-10 px-3"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold text-grid-navy">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-slate-600">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
