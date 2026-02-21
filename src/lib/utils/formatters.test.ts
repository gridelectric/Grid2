import { describe, expect, it } from 'vitest';

import { formatDateTime, formatTime } from './formatters';

describe('time formatters', () => {
  it('uses 24-hour format for time-only values', () => {
    const result = formatTime(new Date('2026-02-21T17:05:00Z'));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    expect(result).not.toMatch(/AM|PM/i);
  });

  it('uses 24-hour format for date-time values', () => {
    const result = formatDateTime(new Date('2026-02-21T17:05:00Z'));
    expect(result).toMatch(/\d{2}:\d{2}$/);
    expect(result).not.toMatch(/AM|PM/i);
  });
});
