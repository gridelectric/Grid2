import { describe, expect, it } from 'vitest';

import type { UserRole } from '../../types';
import { getPortalRole, isPortalPathAllowed } from './portalAccess';

describe('getPortalRole', () => {
  it('maps admin-class roles to admin portal', () => {
    const adminRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM_LEAD', 'READ_ONLY'];

    for (const role of adminRoles) {
      expect(getPortalRole(role)).toBe('admin');
    }
  });

  it('maps contractor to subcontractor portal', () => {
    expect(getPortalRole('CONTRACTOR')).toBe('subcontractor');
  });

  it('returns null for unknown role inputs', () => {
    expect(getPortalRole('UNKNOWN_ROLE')).toBeNull();
    expect(getPortalRole(null)).toBeNull();
  });
});

describe('isPortalPathAllowed', () => {
  it('allows admin portal paths for admin users', () => {
    expect(isPortalPathAllowed('/admin/dashboard', 'admin')).toBe(true);
    expect(isPortalPathAllowed('/admin/subcontractors', 'admin')).toBe(true);
  });

  it('blocks subcontractor portal paths for admin users', () => {
    expect(isPortalPathAllowed('/subcontractor/dashboard', 'admin')).toBe(false);
  });

  it('allows subcontractor portal paths for subcontractors', () => {
    expect(isPortalPathAllowed('/subcontractor/dashboard', 'subcontractor')).toBe(true);
    expect(isPortalPathAllowed('/subcontractor/map', 'subcontractor')).toBe(true);
  });

  it('blocks admin portal paths for subcontractors', () => {
    expect(isPortalPathAllowed('/admin/dashboard', 'subcontractor')).toBe(false);
  });

  it('keeps shared routes available to both portal roles', () => {
    expect(isPortalPathAllowed('/tickets', 'admin')).toBe(true);
    expect(isPortalPathAllowed('/tickets', 'subcontractor')).toBe(true);
  });
});
