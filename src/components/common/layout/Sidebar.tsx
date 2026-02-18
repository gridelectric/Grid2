'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Clock,
  Cloud,
  FileText,
  LayoutDashboard,
  Map,
  Menu,
  Receipt,
  Ticket,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { NavigationSignals } from '@/hooks/useNavigationSignals';
import { cn } from '@/lib/utils';

import { ADMIN_SIDEBAR_NAV_ITEMS, CONTRACTOR_SIDEBAR_NAV_ITEMS, type NavLinkItem } from './navigationConfig';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole: 'admin' | 'contractor';
  signals: NavigationSignals;
}

const iconByHref = {
  '/admin/dashboard': LayoutDashboard,
  '/tickets': Ticket,
  '/admin/contractors': Users,
  '/admin/storms': Cloud,
  '/admin/time-review': Clock,
  '/admin/expense-review': Receipt,
  '/admin/assessment-review': FileText,
  '/admin/invoice-generation': FileText,
  '/admin/reports': BarChart3,
  '/admin/map': Map,
  '/contractor/map': Map,
  '/contractor/time': Clock,
  '/contractor/expenses': Receipt,
  '/contractor/assessments/create': FileText,
  '/contractor/invoices': FileText,
} as const;

function getNavIcon(href: string) {
  return iconByHref[href as keyof typeof iconByHref] ?? FileText;
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

function renderBadge(item: NavLinkItem, signals: NavigationSignals) {
  if (!item.signalKey) {
    return null;
  }

  const count = signals.counts[item.signalKey];
  if (item.badgeStyle === 'dot') {
    return (
      <span
        aria-hidden
        className={count > 0 ? 'storm-lightning-dot' : 'storm-lightning-dot-soft'}
      />
    );
  }

  if (count <= 0) {
    return null;
  }

  return (
    <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-grid-lightning px-1 text-[11px] font-semibold text-grid-navy">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Sidebar({ isOpen, onClose, userRole, signals }: SidebarProps) {
  const pathname = usePathname();
  const navItems: NavLinkItem[] =
    userRole === 'admin' ? ADMIN_SIDEBAR_NAV_ITEMS : CONTRACTOR_SIDEBAR_NAV_ITEMS;

  const renderNavContent = () => (
    <div className="flex h-full flex-col bg-gradient-storm text-white shadow-[inset_-0.5px_0_0_rgba(255,192,56,0.4)]">
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = getNavIcon(item.href);
            const isActive = isItemActive(pathname, item);

            return (
              <Link
                className={cn(
                  'transition-grid group flex min-h-11 items-center gap-3 rounded-xl border-[0.5px] px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,192,56,0.7)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--grid-navy)]',
                  isActive
                    ? 'border-[rgba(255,192,56,0.62)] bg-[linear-gradient(90deg,rgba(255,192,56,0.24)_0%,rgba(255,255,255,0.16)_55%,rgba(255,255,255,0.12)_100%)] text-white shadow-[inset_0_0_0_0.5px_rgba(255,192,56,0.46)]'
                    : 'border-transparent text-blue-100 hover:border-[rgba(255,192,56,0.5)] hover:bg-[linear-gradient(90deg,rgba(255,192,56,0.14)_0%,rgba(255,255,255,0.08)_72%,rgba(255,255,255,0.07)_100%)] hover:text-white'
                )}
                href={item.href}
                key={item.href}
                onClick={onClose}
              >
                <Icon className={cn('h-5 w-5 transition-grid', isActive ? 'text-grid-lightning' : 'text-blue-100 group-hover:text-grid-lightning')} />
                <span className="flex-1">{item.label}</span>
                {renderBadge(item, signals)}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-1 border-t-[0.5px] border-[rgba(255,192,56,0.35)] p-4">
        <p className="text-xs text-blue-200">
          {signals.isOnline ? 'Online sync ready' : 'Offline mode active'}
        </p>
        <p className="text-xs text-blue-200/80">Grid Electric Services v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      <Sheet
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            onClose?.();
          }
        }}
        open={isOpen}
      >
        <SheetContent className="w-72 border-r-[0.5px] border-r-[rgba(255,192,56,0.55)] p-0" side="left">
          {renderNavContent()}
        </SheetContent>
      </Sheet>

      <aside
        className="hidden w-72 border-r-[0.5px] border-r-[rgba(255,192,56,0.55)] lg:block"
        style={{
          top: 'calc(var(--top-bar-height) + var(--offline-banner-height) - 1px)',
          height: 'calc(100vh - var(--top-bar-height) - var(--offline-banner-height) + 1px)',
          position: 'fixed',
          left: 0,
          zIndex: 20,
        }}
      >
        {renderNavContent()}
      </aside>

      <div className="hidden w-72 flex-shrink-0 lg:block" />
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button className="h-11 w-11 text-white hover:bg-white/15 hover:text-white lg:hidden" onClick={onClick} size="icon" variant="ghost">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open navigation menu</span>
    </Button>
  );
}
