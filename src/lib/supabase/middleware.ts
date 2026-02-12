import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canPerformManagementAction, getManagementActionForPath } from '@/lib/auth/authorization';
import { getOnboardingResolutionPath, isOnboardingVerified, isStormFeaturePath } from '@/lib/auth/onboardingAccess';
import { getPortalRole, isPortalPathAllowed } from '@/lib/auth/portalAccess';
import { getActivityCookieValue, isSessionExpired, SESSION_ACTIVITY_COOKIE } from '@/lib/auth/sessionTimeout';
import { Database } from '@/types/database';

const PUBLIC_ROUTE_PREFIXES = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/magic-link',
    '/welcome',
    '/personal-info',
    '/business-info',
    '/insurance',
    '/credentials',
    '/banking',
    '/rates',
    '/agreements',
    '/training',
    '/profile-photo',
    '/review',
    '/pending',
    '/forbidden',
];

type ProfileRole = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>;
type SubcontractorOnboarding = Pick<Database['public']['Tables']['subcontractors']['Row'], 'onboarding_status'>;

interface ProfilesRoleTableClient {
    select: (columns: string) => {
        eq: (column: string, value: string) => {
            single: () => Promise<{ data: ProfileRole | null; error: unknown }>;
        };
    };
}

interface SubcontractorsOnboardingTableClient {
    select: (columns: string) => {
        eq: (column: string, value: string) => {
            maybeSingle: () => Promise<{ data: SubcontractorOnboarding | null; error: unknown }>;
        };
    };
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
    const authCookies = request.cookies
        .getAll()
        .filter((cookie) => cookie.name.startsWith('sb-'));

    authCookies.forEach((cookie) => {
        response.cookies.delete(cookie.name);
    });
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPortalScopedPath(pathname: string): boolean {
    return pathname === '/admin'
        || pathname.startsWith('/admin/')
        || pathname === '/subcontractor'
        || pathname.startsWith('/subcontractor/');
}

function getLoginRedirectResponse(request: NextRequest): NextResponse {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
}

function getForbiddenResponse(request: NextRequest): NextResponse {
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = '/forbidden';
    forbiddenUrl.search = '';
    return NextResponse.rewrite(forbiddenUrl, { status: 403 });
}

function getOnboardingResolutionRedirectResponse(request: NextRequest): NextResponse {
    const resolutionUrl = request.nextUrl.clone();
    const [pathname, searchParams] = getOnboardingResolutionPath().split('?');
    resolutionUrl.pathname = pathname;
    resolutionUrl.search = searchParams ? `?${searchParams}` : '';
    return NextResponse.redirect(resolutionUrl);
}

function setActivityCookie(response: NextResponse) {
    response.cookies.set({
        name: SESSION_ACTIVITY_COOKIE,
        value: getActivityCookieValue(),
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set(name, value);
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    supabaseResponse.cookies.set(name, value, options);
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set(name, '');
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    supabaseResponse.cookies.set(name, '', options);
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very difficult to debug
    // issues with users being logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const managementAction = getManagementActionForPath(pathname);
    const onboardingGatedPath = isStormFeaturePath(pathname);

    if (!user) {
        supabaseResponse.cookies.delete(SESSION_ACTIVITY_COOKIE);

        if (isPublicRoute(pathname)) {
            return supabaseResponse;
        }

        return getLoginRedirectResponse(request);
    }

    const lastActivityTimestamp = request.cookies.get(SESSION_ACTIVITY_COOKIE)?.value;
    if (isSessionExpired(lastActivityTimestamp)) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('reason', 'session-expired');

        const expiredResponse = NextResponse.redirect(loginUrl);
        expiredResponse.cookies.delete(SESSION_ACTIVITY_COOKIE);
        clearSupabaseAuthCookies(request, expiredResponse);
        return expiredResponse;
    }

    if (isPortalScopedPath(pathname) || managementAction || onboardingGatedPath) {
        const profilesTable = supabase.from('profiles') as unknown as ProfilesRoleTableClient;
        const { data: profile } = await profilesTable
            .select('role')
            .eq('id', user.id)
            .single();

        if (isPortalScopedPath(pathname)) {
            const portalRole = getPortalRole(profile?.role);
            if (!isPortalPathAllowed(pathname, portalRole)) {
                return getForbiddenResponse(request);
            }
        }

        if (managementAction && !canPerformManagementAction(profile?.role, managementAction)) {
            return getForbiddenResponse(request);
        }

        if (onboardingGatedPath && profile?.role === 'CONTRACTOR') {
            const subcontractorsTable = supabase.from('subcontractors') as unknown as SubcontractorsOnboardingTableClient;
            const { data: subcontractor } = await subcontractorsTable
                .select('onboarding_status')
                .eq('profile_id', user.id)
                .maybeSingle();

            if (!isOnboardingVerified(subcontractor?.onboarding_status)) {
                return getOnboardingResolutionRedirectResponse(request);
            }
        }
    }

    setActivityCookie(supabaseResponse);

    return supabaseResponse;
}
