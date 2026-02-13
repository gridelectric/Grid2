import { describe, expect, it } from 'vitest';

import type { UserRole } from '../../types';
import {
  canPerformManagementAction,
  getManagementActionForPath,
  type ManagementAction,
} from './authorization';

describe('canPerformManagementAction', () => {
  const superAdminActions: ManagementAction[] = [
    'storm_project_write',
    'ticket_entry_write',
    'contractor_assignment_write',
  ];

  it('allows super admin for all management actions', () => {
    for (const action of superAdminActions) {
      expect(canPerformManagementAction('SUPER_ADMIN', action)).toBe(true);
    }
  });

  it('blocks non-super-admin roles for management actions', () => {
    const blockedRoles: UserRole[] = ['ADMIN', 'CONTRACTOR'];

    for (const role of blockedRoles) {
      for (const action of superAdminActions) {
        expect(canPerformManagementAction(role, action)).toBe(false);
      }
    }
  });
});

describe('getManagementActionForPath', () => {
  it('maps ticket-entry write paths', () => {
    expect(getManagementActionForPath('/tickets/create')).toBe('ticket_entry_write');
  });

  it('does not map deprecated onboarding approval path', () => {
    expect(getManagementActionForPath('/admin/subcontractors/approval')).toBeNull();
  });

  it('maps storm project write paths', () => {
    expect(getManagementActionForPath('/admin/storms/create')).toBe('storm_project_write');
    expect(getManagementActionForPath('/admin/storms/storm-1/edit')).toBe('storm_project_write');
  });

  it('returns null for non-management paths', () => {
    expect(getManagementActionForPath('/tickets')).toBeNull();
    expect(getManagementActionForPath('/admin/dashboard')).toBeNull();
  });
});
