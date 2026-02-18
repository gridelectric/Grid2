'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'storm-metric-card',
  accent: 'storm-metric-card',
  success: 'storm-metric-card',
  warning: 'storm-metric-card',
  danger: 'storm-metric-card',
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  variant = 'default',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up'
    ? 'text-grid-lightning'
    : trend === 'down'
    ? 'text-grid-lightning'
    : 'text-blue-100';

  return (
    <Card
      className={cn(
        variantStyles[variant],
        'transition-grid cursor-pointer rounded-2xl border shadow-[0_10px_24px_rgba(0,33,104,0.18)]',
        'transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-[rgba(255,192,56,0.95)] hover:shadow-[0_14px_32px_rgba(0,33,104,0.28)]',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        'focus-within:ring-2 focus-within:ring-[rgba(255,192,56,0.7)] focus-within:ring-offset-2 focus-within:ring-offset-[rgba(246,249,255,0.9)]',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-blue-50">
          {title}
        </CardTitle>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.12)]">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-1">
            {trend && (
              <TrendIcon className={cn('h-3 w-3', trendColor)} />
            )}
            {trendValue && (
              <span className={cn('text-xs font-medium', trendColor)}>
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-xs text-blue-100">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
