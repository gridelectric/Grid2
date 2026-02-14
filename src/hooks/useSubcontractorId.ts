'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { getErrorLogContext, isAuthOrPermissionError } from '@/lib/utils/errorHandling';

interface UseSubcontractorIdResult {
  subcontractorId: string | undefined;
  isLoading: boolean;
}

export function useSubcontractorId(profileId?: string): UseSubcontractorIdResult {
  const [subcontractorId, setSubcontractorId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setSubcontractorId(undefined);
      setIsLoading(false);
      return;
    }

    let active = true;

    const resolveSubcontractorId = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          if (active) {
            setSubcontractorId(profileId);
          }
          return;
        }

        // Use a bounded list query instead of maybeSingle to tolerate legacy duplicate rows.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('subcontractors') as any)
          .select('id')
          .eq('profile_id', profileId)
          .limit(1);

        if (error) {
          throw error;
        }

        if (active) {
          const resolvedId = Array.isArray(data) && data.length > 0 ? (data[0]?.id as string | undefined) : undefined;
          setSubcontractorId(resolvedId ?? profileId);
        }
      } catch (error) {
        if (!isAuthOrPermissionError(error)) {
          console.warn('Failed to resolve subcontractor ID:', getErrorLogContext(error));
        }
        if (active) {
          setSubcontractorId(profileId);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void resolveSubcontractorId();

    return () => {
      active = false;
    };
  }, [profileId]);

  return { subcontractorId, isLoading };
}
