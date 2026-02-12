import { describe, expect, it } from 'vitest';

import type { UserRole } from '../../types';
import { getLandingPathForRole } from './roleLanding';

describe('getLandingPathForRole', () => {
  it('routes admin-class roles to /admin/dashboard', () => {
    const adminRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM_LEAD', 'READ_ONLY'];

    for (const role of adminRoles) {
      expect(getLandingPathForRole(role)).toBe('/admin/dashboard');
    }
  });

  it('routes contractor role to /tickets', () => {
    expect(getLandingPathForRole('CONTRACTOR')).toBe('/tickets');
  });

  it('falls back to /login for unknown roles', () => {
    expect(getLandingPathForRole('UNKNOWN_ROLE')).toBe('/login');
  });
});
