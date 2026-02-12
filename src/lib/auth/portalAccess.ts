import type { UserRole } from '../../types';

export type PortalRole = 'admin' | 'subcontractor';

const ADMIN_PORTAL_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM_LEAD', 'READ_ONLY'];

function normalizePath(pathname: string): string {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`;
  }

  return pathname;
}

function isAdminPortalPath(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);
  return normalizedPath === '/admin' || normalizedPath.startsWith('/admin/');
}

function isSubcontractorPortalPath(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);
  return normalizedPath === '/subcontractor' || normalizedPath.startsWith('/subcontractor/');
}

export function getPortalRole(role: UserRole | string | null | undefined): PortalRole | null {
  if (!role) {
    return null;
  }

  if (role === 'CONTRACTOR') {
    return 'subcontractor';
  }

  if (ADMIN_PORTAL_ROLES.includes(role as UserRole)) {
    return 'admin';
  }

  return null;
}

export function isPortalPathAllowed(pathname: string, portalRole: PortalRole | null): boolean {
  if (isAdminPortalPath(pathname)) {
    return portalRole === 'admin';
  }

  if (isSubcontractorPortalPath(pathname)) {
    return portalRole === 'subcontractor';
  }

  return true;
}
