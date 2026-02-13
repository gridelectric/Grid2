'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('subcontractors') as any)
          .select('id')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (active) {
          setSubcontractorId(data?.id ?? profileId);
        }
      } catch (error) {
        console.error('Failed to resolve subcontractor ID:', error);
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
