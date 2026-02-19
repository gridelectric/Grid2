'use client';

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('storm-surface overflow-hidden rounded-xl border-[rgba(255,192,56,0.75)] shadow-[0_12px_28px_rgba(0,20,80,0.3)]', className)}>
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 bg-white/10">
              {columns.map((column) => (
                <TableHead key={column.key} style={{ width: column.width }}>
                  <Skeleton className="h-4 w-20 bg-white/20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full bg-white/15" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('storm-surface overflow-hidden rounded-xl border-[rgba(255,192,56,0.75)] shadow-[0_12px_28px_rgba(0,20,80,0.3)]', className)}>
        <div className="flex h-32 items-center justify-center text-blue-100">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('storm-surface overflow-hidden rounded-xl border-[rgba(255,192,56,0.75)] shadow-[0_12px_28px_rgba(0,20,80,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(0,18,72,0.38)]', className)}>
      <Table className="text-blue-50">
        <TableHeader>
          <TableRow className="border-white/20 bg-white/10">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                style={{ width: column.width }}
                className="font-semibold text-blue-100"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-white/12 text-blue-50',
                onRowClick && 'cursor-pointer transition-all duration-300 hover:bg-white/10 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
              )}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
