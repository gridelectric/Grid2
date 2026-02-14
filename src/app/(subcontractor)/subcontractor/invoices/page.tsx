import { redirect } from 'next/navigation';

export default function LegacyContractorInvoicesRedirect() {
  redirect('/contractor/invoices');
}
