import { Suspense } from 'react';

import { TicketNewClientPage } from './ticket-new-client-page';

interface TicketNewPageProps {
  params: Promise<{ stormId: string }>;
}

export default async function TicketNewPage({ params }: TicketNewPageProps) {
  const { stormId } = await params;

  return (
    <Suspense fallback={<div className="storm-surface rounded-xl p-4 text-sm text-slate-500">Loading ticket form...</div>}>
      <TicketNewClientPage stormId={stormId} />
    </Suspense>
  );
}
