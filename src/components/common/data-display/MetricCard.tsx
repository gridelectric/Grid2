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
  default: 'storm-surface bg-grid-surface',
  accent: 'border-grid-surface bg-grid-storm-50',
  success: 'border-grid-surface bg-grid-storm-100',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-red-200 bg-red-50',
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
    ? 'text-grid-blue'
    : trend === 'down'
    ? 'text-red-600'
    : 'text-slate-400';

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-grid-navy">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              <TrendIcon className={cn('w-3 h-3', trendColor)} />
            )}
            {trendValue && (
              <span className={cn('text-xs font-medium', trendColor)}>
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
