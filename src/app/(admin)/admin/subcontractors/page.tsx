import { redirect } from 'next/navigation';

export default function LegacyAdminContractorsRedirect() {
  redirect('/admin/contractors');
}
