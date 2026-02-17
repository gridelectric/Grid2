'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, LayoutDashboard, Map, Ticket, User } from 'lucide-react';

import type { NavigationSignals } from '@/hooks/useNavigationSignals';
import { cn } from '@/lib/utils';

import {
  ADMIN_BOTTOM_NAV_ITEMS,
  CONTRACTOR_BOTTOM_NAV_ITEMS,
  type NavLinkItem,
} from './navigationConfig';

interface BottomNavProps {
  userRole: 'admin' | 'contractor';
  signals: NavigationSignals;
}

const iconByHref = {
  '/admin/dashboard': LayoutDashboard,
  '/tickets': Ticket,
  '/admin/contractors': User,
  '/admin/map': Map,
  '/contractor/map': Map,
  '/contractor/time': Clock,
} as const;

function getNavIcon(href: string) {
  return iconByHref[href as keyof typeof iconByHref] ?? Ticket;
}

function isItemActive(pathname: string | null, item: NavLinkItem): boolean {
  if (!pathname) {
    return false;
  }

  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  if (!item.matchPaths || item.matchPaths.length === 0) {
    return false;
  }

  return item.matchPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function renderBottomBadge(item: NavLinkItem, signals: NavigationSignals) {
  if (!item.signalKey) {
    return null;
  }

  const count = signals.counts[item.signalKey];
  if (item.badgeStyle === 'dot') {
    return (
      <span
        aria-hidden
        className={cn(
          'absolute right-4 top-2 h-2 w-2 rounded-full',
          count > 0 ? 'bg-grid-lightning' : 'bg-[var(--grid-gray-300)]'
        )}
      />
    );
  }

  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute right-3 top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-grid-lightning px-1 text-[10px] font-semibold text-grid-navy">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function BottomNav({ userRole, signals }: BottomNavProps) {
  const pathname = usePathname();
  const navItems: NavLinkItem[] =
    userRole === 'admin' ? ADMIN_BOTTOM_NAV_ITEMS : CONTRACTOR_BOTTOM_NAV_ITEMS;

  return (
    <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-40 border-t border-grid-surface bg-white/95 backdrop-blur lg:hidden">
      <div
        className="grid h-16 items-center gap-1 px-2"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const Icon = getNavIcon(item.href);
          const isActive = isItemActive(pathname, item);

          return (
            <Link
              className={cn(
                'transition-grid relative flex min-h-11 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-medium',
                isActive
                  ? 'bg-grid-storm-100 text-grid-navy'
                  : 'text-grid-muted hover:bg-grid-storm-50 hover:text-grid-navy'
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="mb-0.5 h-5 w-5" />
              <span>{item.mobileLabel ?? item.label}</span>
              {renderBottomBadge(item, signals)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
