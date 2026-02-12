import type { UserRole } from '../../types';

export type ManagementAction =
  | 'storm_project_write'
  | 'ticket_entry_write'
  | 'contractor_assignment_write';

function normalizePath(pathname: string): string {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`;
  }

  return pathname;
}

export function getManagementActionForPath(pathname: string): ManagementAction | null {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === '/tickets/create') {
    return 'ticket_entry_write';
  }

  if (normalizedPath === '/admin/subcontractors/approval') {
    return 'contractor_assignment_write';
  }

  if (
    normalizedPath === '/admin/storms/create'
    || (normalizedPath.startsWith('/admin/storms/') && normalizedPath.endsWith('/edit'))
  ) {
    return 'storm_project_write';
  }

  return null;
}

export function canPerformManagementAction(
  role: UserRole | string | null | undefined,
  action: ManagementAction
): boolean {
  if (!role) {
    return false;
  }

  if (action === 'storm_project_write') {
    return role === 'SUPER_ADMIN';
  }

  if (action === 'ticket_entry_write') {
    return role === 'SUPER_ADMIN';
  }

  if (action === 'contractor_assignment_write') {
    return role === 'SUPER_ADMIN';
  }

  return false;
}
