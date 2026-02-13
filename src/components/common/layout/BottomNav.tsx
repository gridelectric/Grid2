'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ADMIN_BOTTOM_NAV_ITEMS,
  CONTRACTOR_BOTTOM_NAV_ITEMS,
  NavLinkItem,
} from './navigationConfig';
import {
  Clock,
  LayoutDashboard,
  Map,
  Ticket,
  User,
} from 'lucide-react';

interface BottomNavProps {
  userRole: 'admin' | 'contractor';
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

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const navItems: NavLinkItem[] =
    userRole === 'admin' ? ADMIN_BOTTOM_NAV_ITEMS : CONTRACTOR_BOTTOM_NAV_ITEMS;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t z-40 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = getNavIcon(item.href);
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
