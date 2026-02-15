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
import { BrandMark } from '@/components/common/brand/BrandMark';
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
    <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-grid-lightning px-1 text-[11px] font-semibold text-slate-900">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Sidebar({ isOpen, onClose, userRole, signals }: SidebarProps) {
  const pathname = usePathname();
  const navItems: NavLinkItem[] =
    userRole === 'admin' ? ADMIN_SIDEBAR_NAV_ITEMS : CONTRACTOR_SIDEBAR_NAV_ITEMS;

  const renderNavContent = () => (
    <div className="flex h-full flex-col bg-gradient-storm text-white">
      <div className="flex h-16 items-center border-b border-white/15 px-6">
        <BrandMark
          portalLabel={userRole === 'admin' ? 'Admin Portal' : 'Contractor Portal'}
          tone="light"
          variant="full"
        />
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = getNavIcon(item.href);
            const isActive = isItemActive(pathname, item);

            return (
              <Link
                className={cn(
                  'transition-grid group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive
                    ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.24)]'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                )}
                href={item.href}
                key={item.href}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {renderBadge(item, signals)}
                {isActive ? <span aria-hidden className="storm-lightning-dot" /> : null}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-1 border-t border-white/15 p-4">
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
        <SheetContent className="w-72 p-0" side="left">
          {renderNavContent()}
        </SheetContent>
      </Sheet>

      <aside
        className="hidden w-72 border-r border-grid-surface lg:block"
        style={{
          top: 'calc(var(--top-bar-height) + var(--offline-banner-height))',
          height: 'calc(100vh - var(--top-bar-height) - var(--offline-banner-height))',
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
    <Button className="h-11 w-11 lg:hidden" onClick={onClick} size="icon" variant="ghost">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open navigation menu</span>
    </Button>
  );
}
