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
import { contractorService, type ContractorListItem } from '@/lib/services/contractorService';
import { getErrorMessage, isAuthOrPermissionError } from '@/lib/utils/errorHandling';
import { formatCurrency } from '@/lib/utils/formatters';
import { Users, UserCheck, UserPlus, UserX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function toDisplayStatus(item: ContractorListItem): string {
  if (item.onboardingStatus.toUpperCase() === 'APPROVED') {
    return item.eligibleForAssignment ? 'Active' : 'Inactive';
  }

  if (item.onboardingStatus.toUpperCase() === 'PENDING') {
    return 'Pending';
  }

  return 'Onboarding';
}

export default function ContractorsListPage() {
  const [contractors, setContractors] = useState<ContractorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;

    const loadContractors = async () => {
      setIsLoading(true);
      try {
        const items = await contractorService.listContractors();
        if (active) {
          setContractors(items);
        }
      } catch (error) {
        if (!isAuthOrPermissionError(error)) {
          toast.error(getErrorMessage(error, 'Failed to load contractors'));
        }
        if (active) {
          setContractors([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadContractors();

    return () => {
      active = false;
    };
  }, []);

  const filteredData = useMemo(() => contractors.filter((contractor) => {
    const matchesSearch = searchQuery.trim().length === 0
      || contractor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      || contractor.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      || toDisplayStatus(contractor).toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [searchQuery, statusFilter, contractors]);

  const columns: Column<ContractorListItem>[] = useMemo(() => [
    {
      key: 'fullName',
      header: 'Name',
      cell: (contractor) => (
        <div className="space-y-1">
          <Link
            href={`/admin/contractors/${contractor.id}`}
            className="font-medium text-grid-blue hover:text-grid-blue-dark"
          >
            {contractor.fullName}
          </Link>
          <p className="text-xs text-grid-muted">{contractor.businessName}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (contractor) => <StatusBadge status={toDisplayStatus(contractor)} size="sm" />,
    },
    {
      key: 'eligible',
      header: 'Eligible',
      cell: (contractor) => (
        <span className={contractor.eligibleForAssignment ? 'text-grid-success' : 'text-grid-subtle'}>
          {contractor.eligibleForAssignment ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'tickets',
      header: 'Active Tickets',
      cell: (contractor) => contractor.activeTicketCount,
    },
    {
      key: 'ytdEarnings',
      header: 'YTD Earnings',
      cell: (contractor) => formatCurrency(contractor.ytdEarnings),
    },
    {
      key: 'alerts',
      header: 'Alerts',
      cell: (contractor) => contractor.alerts.length > 0 ? (
        <span className="flex items-center gap-1 text-yellow-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {contractor.alerts[0]}
        </span>
      ) : (
        <span className="text-grid-subtle">-</span>
      ),
    },
  ], []);

  const totalCount = contractors.length;
  const activeCount = contractors.filter((contractor) => toDisplayStatus(contractor) === 'Active').length;
  const onboardingCount = contractors.filter((contractor) => toDisplayStatus(contractor) === 'Onboarding').length;
  const pendingCount = contractors.filter((contractor) => toDisplayStatus(contractor) === 'Pending').length;
  const expiringCount = contractors.filter((contractor) => contractor.alerts.length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractors"
        description="Manage your workforce and view performance metrics"
      >
        <Button asChild variant="storm">
          <Link href="/admin/contractors/invite">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Contractor
          </Link>
        </Button>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total"
          value={totalCount}
          icon={<Users className="w-4 h-4 text-grid-blue" />}
        />
        <MetricCard
          title="Active"
          value={activeCount}
          icon={<UserCheck className="w-4 h-4 text-grid-success" />}
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
          icon={<UserX className="w-4 h-4 text-grid-navy" />}
          variant="default"
        />
        <MetricCard
          title="Expiring"
          value={expiringCount}
          icon={<AlertTriangle className="w-4 h-4 text-grid-danger" />}
          variant="danger"
        />
      </div>

      {/* Filters */}
      <div className="storm-surface flex flex-col gap-4 rounded-xl p-4 sm:flex-row">
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="storm-contrast-field sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="storm-contrast-field sm:max-w-xs">
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
        <Button variant="storm" className="sm:ml-auto">
          Export
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(contractor) => contractor.id}
        isLoading={isLoading}
      />
    </div>
  );
}
