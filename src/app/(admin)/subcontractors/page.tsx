'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { MetricCard } from '@/components/common/data-display/MetricCard';
import { StatusBadge } from '@/components/common/data-display/StatusBadge';
import { DataTable, Column } from '@/components/common/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { subcontractorService, type SubcontractorListItem } from '@/lib/services/subcontractorService';
import { formatCurrency } from '@/lib/utils/formatters';
import { Users, UserCheck, UserPlus, UserX, AlertTriangle } from 'lucide-react';

function toDisplayStatus(item: SubcontractorListItem): string {
  if (item.onboardingStatus.toUpperCase() === 'APPROVED') {
    return item.eligibleForAssignment ? 'Active' : 'Inactive';
  }

  if (item.onboardingStatus.toUpperCase() === 'PENDING') {
    return 'Pending';
  }

  return 'Onboarding';
}

export default function SubcontractorsListPage() {
  const [subcontractors, setSubcontractors] = useState<SubcontractorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;

    const loadSubcontractors = async () => {
      setIsLoading(true);
      try {
        const items = await subcontractorService.listSubcontractors();
        if (active) {
          setSubcontractors(items);
        }
      } catch (error) {
        console.error('Failed to load subcontractors:', error);
        if (active) {
          setSubcontractors([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadSubcontractors();

    return () => {
      active = false;
    };
  }, []);

  const filteredData = useMemo(() => subcontractors.filter((subcontractor) => {
    const matchesSearch = searchQuery.trim().length === 0
      || subcontractor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      || subcontractor.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      || toDisplayStatus(subcontractor).toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [searchQuery, statusFilter, subcontractors]);

  const columns: Column<SubcontractorListItem>[] = useMemo(() => [
    {
      key: 'fullName',
      header: 'Name',
      cell: (subcontractor) => (
        <div className="space-y-1">
          <Link
            href={`/admin/contractors/${subcontractor.id}`}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            {subcontractor.fullName}
          </Link>
          <p className="text-xs text-slate-500">{subcontractor.businessName}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (subcontractor) => <StatusBadge status={toDisplayStatus(subcontractor)} size="sm" />,
    },
    {
      key: 'eligible',
      header: 'Eligible',
      cell: (subcontractor) => (
        <span className={subcontractor.eligibleForAssignment ? 'text-green-600' : 'text-slate-400'}>
          {subcontractor.eligibleForAssignment ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'tickets',
      header: 'Active Tickets',
      cell: (subcontractor) => subcontractor.activeTicketCount,
    },
    {
      key: 'ytdEarnings',
      header: 'YTD Earnings',
      cell: (subcontractor) => formatCurrency(subcontractor.ytdEarnings),
    },
    {
      key: 'alerts',
      header: 'Alerts',
      cell: (subcontractor) => subcontractor.alerts.length > 0 ? (
        <span className="flex items-center gap-1 text-yellow-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {subcontractor.alerts[0]}
        </span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
  ], []);

  const totalCount = subcontractors.length;
  const activeCount = subcontractors.filter((subcontractor) => toDisplayStatus(subcontractor) === 'Active').length;
  const onboardingCount = subcontractors.filter((subcontractor) => toDisplayStatus(subcontractor) === 'Onboarding').length;
  const pendingCount = subcontractors.filter((subcontractor) => toDisplayStatus(subcontractor) === 'Pending').length;
  const expiringCount = subcontractors.filter((subcontractor) => subcontractor.alerts.length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subcontractors"
        description="Manage your workforce and view performance metrics"
      >
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Subcontractor
        </Button>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total"
          value={totalCount}
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <MetricCard
          title="Active"
          value={activeCount}
          icon={<UserCheck className="w-4 h-4 text-green-600" />}
        />
        <MetricCard
          title="Onboarding"
          value={onboardingCount}
          icon={<UserPlus className="w-4 h-4 text-yellow-600" />}
          variant="warning"
        />
        <MetricCard
          title="Pending"
          value={pendingCount}
          icon={<UserX className="w-4 h-4 text-slate-600" />}
          variant="default"
        />
        <MetricCard
          title="Expiring"
          value={expiringCount}
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          variant="danger"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="sm:ml-auto">
          Export
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(subcontractor) => subcontractor.id}
        isLoading={isLoading}
      />
    </div>
  );
}
