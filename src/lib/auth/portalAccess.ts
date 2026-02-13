import type { UserRole } from '../../types';

export type PortalRole = 'admin' | 'contractor';

const ADMIN_PORTAL_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

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

function isContractorPortalPath(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);
  return (
    normalizedPath === '/contractor'
    || normalizedPath.startsWith('/contractor/')
    || normalizedPath === '/subcontractor'
    || normalizedPath.startsWith('/subcontractor/')
  );
}

export function getPortalRole(role: UserRole | string | null | undefined): PortalRole | null {
  if (!role) {
    return null;
  }

  if (role === 'CONTRACTOR') {
    return 'contractor';
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

  if (isContractorPortalPath(pathname)) {
    return portalRole === 'contractor';
  }

  return true;
}
