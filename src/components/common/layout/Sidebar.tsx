'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  ADMIN_SIDEBAR_NAV_ITEMS,
  CONTRACTOR_SIDEBAR_NAV_ITEMS,
  NavLinkItem,
} from './navigationConfig';
import {
  BarChart3,
  Cloud,
  Clock,
  FileText,
  LayoutDashboard,
  Map,
  Menu,
  Receipt,
  Ticket,
  Users,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole: 'admin' | 'contractor';
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

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const navItems: NavLinkItem[] =
    userRole === 'admin' ? ADMIN_SIDEBAR_NAV_ITEMS : CONTRACTOR_SIDEBAR_NAV_ITEMS;

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b">
        <div className="w-8 h-8 mr-3 shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/icons/grid-ge-storm-icon-clean.svg"
            alt="Grid Electric logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            priority
          />
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white">Grid Electric</span>
          <span className="text-xs text-slate-500 block">{userRole === 'admin' ? 'Admin Portal' : 'Contractor Portal'}</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = getNavIcon(item.href);
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-slate-500 text-center">
          Grid Electric Services v1.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 p-0">
          {renderNavContent()}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-slate-800 border-r z-10">
        {renderNavContent()}
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
