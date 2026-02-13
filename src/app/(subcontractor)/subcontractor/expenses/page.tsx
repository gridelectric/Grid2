import { redirect } from 'next/navigation';

export default function LegacySubcontractorExpensesRedirect() {
  redirect('/contractor/expenses');
}
