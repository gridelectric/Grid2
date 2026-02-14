import { redirect } from 'next/navigation';

interface LegacyAdminContractorDetailRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyAdminContractorDetailRedirect({
  params,
}: LegacyAdminContractorDetailRedirectProps) {
  const { id } = await params;
  redirect(`/admin/contractors/${id}`);
}
