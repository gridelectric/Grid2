import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canPerformManagementAction, getManagementActionForPath } from '@/lib/auth/authorization';
import { shouldEnforcePasswordReset } from '@/lib/auth/passwordResetGate';
import { getPortalRole, isPortalPathAllowed } from '@/lib/auth/portalAccess';
import { getActivityCookieValue, isSessionExpired, SESSION_ACTIVITY_COOKIE } from '@/lib/auth/sessionTimeout';
import { Database } from '@/types/database';

const PUBLIC_ROUTE_PREFIXES = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/magic-link',
    '/forbidden',
];

const REMOVED_ONBOARDING_ROUTE_PREFIXES = [
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
];

type ProfileAccess = Pick<Database['public']['Tables']['profiles']['Row'], 'role' | 'must_reset_password'>;

interface ProfilesAccessTableClient {
    select: (columns: string) => {
        eq: (column: string, value: string) => {
            single: () => Promise<{ data: ProfileAccess | null; error: unknown }>;
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

function isRemovedOnboardingRoute(pathname: string): boolean {
    return REMOVED_ONBOARDING_ROUTE_PREFIXES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}

function isPortalScopedPath(pathname: string): boolean {
    return pathname === '/admin'
        || pathname.startsWith('/admin/')
        || pathname === '/contractor'
        || pathname.startsWith('/contractor/')
        || pathname === '/subcontractor'
        || pathname.startsWith('/subcontractor/');
}

function getLoginRedirectResponse(request: NextRequest, reason?: string): NextResponse {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (reason) {
        loginUrl.searchParams.set('reason', reason);
    }
    return NextResponse.redirect(loginUrl);
}

function getForbiddenResponse(request: NextRequest): NextResponse {
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = '/forbidden';
    forbiddenUrl.search = '';
    return NextResponse.rewrite(forbiddenUrl, { status: 403 });
}

function getSetPasswordRedirectResponse(request: NextRequest): NextResponse {
    const passwordUrl = request.nextUrl.clone();
    passwordUrl.pathname = '/set-password';
    passwordUrl.search = '';
    return NextResponse.redirect(passwordUrl);
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
    const pathname = request.nextUrl.pathname;

    if (pathname === '/subcontractor' || pathname.startsWith('/subcontractor/')) {
        const contractorUrl = request.nextUrl.clone();
        contractorUrl.pathname = pathname.replace(/^\/subcontractor/, '/contractor');
        return NextResponse.redirect(contractorUrl);
    }

    if (isRemovedOnboardingRoute(pathname)) {
        return getLoginRedirectResponse(request, 'onboarding-removed');
    }

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

    const managementAction = getManagementActionForPath(pathname);

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

    const profilesTable = supabase.from('profiles') as unknown as ProfilesAccessTableClient;
    const { data: profile } = await profilesTable
        .select('role, must_reset_password')
        .eq('id', user.id)
        .single();

    if (shouldEnforcePasswordReset(profile?.must_reset_password, pathname)) {
        return getSetPasswordRedirectResponse(request);
    }

    if (isPortalScopedPath(pathname)) {
        const portalRole = getPortalRole(profile?.role);
        if (!isPortalPathAllowed(pathname, portalRole)) {
            return getForbiddenResponse(request);
        }
    }

    if (managementAction && !canPerformManagementAction(profile?.role, managementAction)) {
        return getForbiddenResponse(request);
    }

    setActivityCookie(supabaseResponse);

    return supabaseResponse;
}
