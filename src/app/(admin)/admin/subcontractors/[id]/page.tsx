import { redirect } from 'next/navigation';

interface LegacyAdminSubcontractorDetailRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyAdminSubcontractorDetailRedirect({
  params,
}: LegacyAdminSubcontractorDetailRedirectProps) {
  const { id } = await params;
  redirect(`/admin/contractors/${id}`);
}
