const STORM_FEATURE_PREFIXES = ['/tickets', '/contractor', '/contractor'] as const;

export function isStormFeaturePath(pathname: string): boolean {
  return STORM_FEATURE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isOnboardingVerified(onboardingStatus: string | null | undefined): boolean {
  return onboardingStatus === 'APPROVED';
}

export function getOnboardingResolutionPath(): string {
  return '/review?reason=onboarding-required';
}
