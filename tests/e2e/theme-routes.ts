export interface ThemeRouteCheck {
  path: string;
  requiresContrastButton?: boolean;
  requiresContrastField?: boolean;
}

export const ADMIN_THEME_ROUTES: ThemeRouteCheck[] = [
  { path: '/admin/dashboard', requiresContrastButton: true, requiresContrastField: true },
  { path: '/admin/reports', requiresContrastButton: true, requiresContrastField: true },
  { path: '/admin/storms', requiresContrastButton: true },
  { path: '/admin/storms/create', requiresContrastButton: true, requiresContrastField: true },
  { path: '/admin/map', requiresContrastButton: true },
  { path: '/admin/time-review' },
  { path: '/admin/expense-review' },
  { path: '/admin/assessment-review' },
  { path: '/admin/invoice-generation' },
];

