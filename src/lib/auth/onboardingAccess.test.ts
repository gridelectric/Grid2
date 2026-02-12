import { describe, expect, it } from 'vitest';

import {
  getOnboardingResolutionPath,
  isOnboardingVerified,
  isStormFeaturePath,
} from './onboardingAccess';

describe('isStormFeaturePath', () => {
  it('matches contractor storm feature routes', () => {
    expect(isStormFeaturePath('/tickets')).toBe(true);
    expect(isStormFeaturePath('/tickets/123')).toBe(true);
    expect(isStormFeaturePath('/subcontractor')).toBe(true);
    expect(isStormFeaturePath('/subcontractor/map')).toBe(true);
  });

  it('does not match onboarding/auth routes', () => {
    expect(isStormFeaturePath('/review')).toBe(false);
    expect(isStormFeaturePath('/insurance')).toBe(false);
    expect(isStormFeaturePath('/login')).toBe(false);
    expect(isStormFeaturePath('/admin/dashboard')).toBe(false);
  });
});

describe('isOnboardingVerified', () => {
  it('returns true only when onboarding status is APPROVED', () => {
    expect(isOnboardingVerified('APPROVED')).toBe(true);
    expect(isOnboardingVerified('PENDING')).toBe(false);
    expect(isOnboardingVerified('SUSPENDED')).toBe(false);
    expect(isOnboardingVerified(null)).toBe(false);
    expect(isOnboardingVerified(undefined)).toBe(false);
  });
});

describe('getOnboardingResolutionPath', () => {
  it('returns onboarding resolution redirect path', () => {
    expect(getOnboardingResolutionPath()).toBe('/review?reason=onboarding-required');
  });
});
