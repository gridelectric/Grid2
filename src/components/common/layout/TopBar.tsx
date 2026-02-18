'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, Loader2, LogOut, RefreshCw, Settings, ShieldAlert, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BrandMark } from '@/components/common/brand/BrandMark';
import type { NavigationSignals } from '@/hooks/useNavigationSignals';

import { SidebarTrigger } from './Sidebar';

interface TopBarProps {
  onMenuClick: () => void;
  userName: string;
  userRole: string;
  userPortal: 'admin' | 'contractor';
  onSignOut: () => void;
  signals: NavigationSignals;
  isSignalsLoading: boolean;
  onRefreshSignals: () => Promise<void>;
}

function getPortalLabel(portal: 'admin' | 'contractor'): 'Admin Portal' | 'Contractor Portal' {
  return portal === 'admin' ? 'Admin Portal' : 'Contractor Portal';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TopBar({
  onMenuClick,
  userName,
  userRole,
  userPortal,
  onSignOut,
  signals,
  isSignalsLoading,
  onRefreshSignals,
}: TopBarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <header
      className="fixed left-0 right-0 z-50 bg-transparent shadow-[inset_0_-0.5px_0_rgba(255,192,56,0.55)]"
      style={{ height: 'var(--top-bar-height)', top: 'var(--offline-banner-height)' }}
    >
      <div className="topbar-center-gradient flex h-full w-full items-center justify-between gap-4 px-4 text-white sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <SidebarTrigger onClick={onMenuClick} />
          <Link className="inline-flex items-center lg:hidden" href="/tickets">
            <BrandMark variant="compact" />
          </Link>
          <div className="hidden lg:block">
            <BrandMark portalLabel={getPortalLabel(userPortal)} tone="light" variant="full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="relative text-white hover:bg-white/15 hover:text-white" size="icon" variant="ghost">
                <Bell className="h-5 w-5" />
                {signals.notificationCount > 0 ? (
                  <span className="absolute right-1.5 top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-grid-lightning px-1 text-[10px] font-semibold text-grid-navy">
                    {signals.notificationCount > 99 ? '99+' : signals.notificationCount}
                  </span>
                ) : null}
                <span className="sr-only">Open operations summary</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="storm-surface w-80 p-0">
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-grid-navy">Operations Summary</p>
                    <p className="text-xs text-muted-foreground">
                      {signals.isOnline ? 'Online and synced' : 'Offline mode active'}
                    </p>
                  </div>
                  <Badge variant={signals.isOnline ? 'secondary' : 'destructive'}>
                    {signals.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-grid-surface bg-grid-surface p-2">
                    <p className="text-muted-foreground">Tickets</p>
                    <p className="text-sm font-semibold">{signals.counts.tickets}</p>
                  </div>
                  <div className="rounded-md border border-grid-surface bg-grid-surface p-2">
                    <p className="text-muted-foreground">Pending Reviews</p>
                    <p className="text-sm font-semibold">{signals.counts.reviews}</p>
                  </div>
                  <div className="rounded-md border border-grid-surface bg-grid-surface p-2">
                    <p className="text-muted-foreground">Sync Queue</p>
                    <p className="text-sm font-semibold">{signals.counts.sync}</p>
                  </div>
                  <div className="rounded-md border border-grid-surface bg-grid-surface p-2">
                    <p className="text-muted-foreground">Conflicts</p>
                    <p className="text-sm font-semibold">{signals.counts.conflicts}</p>
                  </div>
                </div>

                <Button
                  className="w-full justify-center"
                  disabled={isRefreshing}
                  onClick={() => {
                    setIsRefreshing(true);
                    void onRefreshSignals().finally(() => {
                      setIsRefreshing(false);
                    });
                  }}
                  size="sm"
                  variant="outline"
                >
                  {isRefreshing || isSignalsLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Signals
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 text-white hover:bg-white/15 hover:text-white" variant="ghost">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-grid-storm-100 text-grid-navy text-sm font-medium">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs capitalize text-blue-100">{userRole.toLowerCase().replace('_', ' ')}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {!signals.isOnline ? (
                <DropdownMenuItem>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Offline mode enabled
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-grid-danger" onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
