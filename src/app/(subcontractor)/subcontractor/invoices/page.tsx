import { redirect } from 'next/navigation';

export default function LegacySubcontractorInvoicesRedirect() {
  redirect('/contractor/invoices');
}
