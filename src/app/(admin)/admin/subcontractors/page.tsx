import { redirect } from 'next/navigation';

export default function LegacyAdminSubcontractorsRedirect() {
  redirect('/admin/contractors');
}
