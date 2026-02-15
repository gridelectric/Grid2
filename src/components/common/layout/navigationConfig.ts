export interface NavLinkItem {
  href: string;
  label: string;
}

export const ADMIN_SIDEBAR_NAV_ITEMS: NavLinkItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/admin/contractors', label: 'Users' },
  { href: '/admin/storms', label: 'Storm Events' },
  { href: '/admin/time-review', label: 'Time Review' },
  { href: '/admin/expense-review', label: 'Expenses' },
  { href: '/admin/assessment-review', label: 'Assessments' },
  { href: '/admin/invoice-generation', label: 'Invoices' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/map', label: 'Map View' },
];

export const CONTRACTOR_SIDEBAR_NAV_ITEMS: NavLinkItem[] = [
  { href: '/tickets', label: 'My Tickets' },
  { href: '/contractor/map', label: 'Map' },
  { href: '/contractor/time', label: 'Time Tracking' },
  { href: '/contractor/expenses', label: 'Expenses' },
  { href: '/contractor/assessments/create', label: 'Assessments' },
  { href: '/contractor/invoices', label: 'Invoices' },
];

export const ADMIN_BOTTOM_NAV_ITEMS: NavLinkItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/admin/contractors', label: 'Users' },
  { href: '/admin/map', label: 'Map' },
];

export const CONTRACTOR_BOTTOM_NAV_ITEMS: NavLinkItem[] = [
  { href: '/tickets', label: 'Tickets' },
  { href: '/contractor/map', label: 'Map' },
  { href: '/contractor/time', label: 'Time' },
];
