import { redirect } from 'next/navigation';

export default function LegacyContractorExpensesRedirect() {
  redirect('/contractor/expenses');
}
