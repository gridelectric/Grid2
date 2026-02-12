import { describe, expect, it } from 'vitest';

import { ADMIN_SIDEBAR_NAV_ITEMS, SUBCONTRACTOR_BOTTOM_NAV_ITEMS } from './navigationConfig';

describe('navigation contracts', () => {
  it('uses exact contractor bottom-nav labels and links', () => {
    expect(SUBCONTRACTOR_BOTTOM_NAV_ITEMS).toEqual([
      { href: '/tickets', label: 'Tickets' },
      { href: '/subcontractor/map', label: 'Map' },
      { href: '/subcontractor/profile', label: 'Profile' },
    ]);
  });

  it('includes required admin sidebar primary items', () => {
    expect(ADMIN_SIDEBAR_NAV_ITEMS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/admin/dashboard', label: 'Dashboard' }),
        expect.objectContaining({ href: '/admin/subcontractors', label: 'Users' }),
        expect.objectContaining({ href: '/admin/storms', label: 'Storms' }),
      ])
    );
  });
});
