'use client';

import { useEffect, useState } from 'react';
import { ticketService } from '@/lib/services/ticketService';
import { StatusBadge } from '@/components/common/data-display/StatusBadge';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';

interface StatusHistoryTimelineProps {
  ticketId: string;
  refreshKey?: number;
}

interface StatusHistoryItem {
  id: string;
  to_status: string;
  changed_at: string;
  change_reason: string | null;
  profiles:
    | {
        first_name: string | null;
        last_name: string | null;
      }
    | null;
}

export function StatusHistoryTimeline({ ticketId, refreshKey }: StatusHistoryTimelineProps) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const data = await ticketService.getStatusHistory(ticketId);
        setHistory((data ?? []) as StatusHistoryItem[]);
      } catch (error) {
        console.error('Failed to load status history:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [ticketId, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground italic">
        No status history available.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold">Status Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/35 before:to-transparent">
          {history.map((item) => (
            <div key={item.id} className="relative flex items-start group">
              {/* Dot */}
              <div className="z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[rgba(255,192,56,0.82)] bg-[#001a52]">
                <div className="h-2 w-2 rounded-full bg-[rgba(255,192,56,0.96)]" />
              </div>
              
              <div className="ml-4 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.to_status} size="sm" />
                    <span className="text-sm font-medium text-blue-50">
                      by {item.profiles?.first_name} {item.profiles?.last_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-col sm:items-end">
                    <span>{format(new Date(item.changed_at), 'MMM d, yyyy h:mm a')}</span>
                    <span className="italic">{formatDistanceToNow(new Date(item.changed_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {item.change_reason && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-white/20 bg-white/10 p-3">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-blue-100">
                      {item.change_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
