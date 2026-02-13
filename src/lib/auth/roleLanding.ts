import type { UserRole } from '../../types';

const ADMIN_LANDING_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

export function getLandingPathForRole(role: UserRole | string | null | undefined): string {
  if (!role) {
    return '/login';
  }

  if (role === 'CONTRACTOR') {
    return '/contractor/time';
  }

  if (ADMIN_LANDING_ROLES.includes(role as UserRole)) {
    return '/admin/dashboard';
  }

  return '/login';
}
