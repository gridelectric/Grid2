import { redirect } from 'next/navigation';

export default function LegacyAdminSubcontractorDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/admin/contractors/${params.id}`);
}
