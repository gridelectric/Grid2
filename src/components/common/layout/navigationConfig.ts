export interface NavLinkItem {
  href: string;
  label: string;
}

export const ADMIN_SIDEBAR_NAV_ITEMS: NavLinkItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/admin/subcontractors', label: 'Users' },
  { href: '/admin/storms', label: 'Storms' },
  { href: '/admin/time-review', label: 'Time Review' },
  { href: '/admin/expense-review', label: 'Expenses' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/map', label: 'Map View' },
  { href: '/admin/settings', label: 'Settings' },
];

export const SUBCONTRACTOR_SIDEBAR_NAV_ITEMS: NavLinkItem[] = [
  { href: '/subcontractor/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'My Tickets' },
  { href: '/subcontractor/map', label: 'Map' },
  { href: '/subcontractor/time', label: 'Time Tracking' },
  { href: '/subcontractor/expenses', label: 'Expenses' },
  { href: '/subcontractor/invoices', label: 'Invoices' },
  { href: '/subcontractor/profile', label: 'Profile' },
];

export const ADMIN_BOTTOM_NAV_ITEMS: NavLinkItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/admin/subcontractors', label: 'Users' },
  { href: '/admin/map', label: 'Map' },
];

export const SUBCONTRACTOR_BOTTOM_NAV_ITEMS: NavLinkItem[] = [
  { href: '/tickets', label: 'Tickets' },
  { href: '/subcontractor/map', label: 'Map' },
  { href: '/subcontractor/profile', label: 'Profile' },
];
