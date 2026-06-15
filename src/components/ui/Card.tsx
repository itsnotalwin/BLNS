import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-[var(--color-surface-2)] border border-[var(--color-border-1)] rounded-[12px] p-6 flex flex-col overflow-hidden relative", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, onAction, actionNode }: { title: string, action?: string, onAction?: () => void, actionNode?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="font-syne text-[16px] font-medium m-0">{title}</span>
      {actionNode ? actionNode : (action && onAction && (
        <span className="text-[13px] text-[var(--color-text-main)] bg-[var(--color-border-1)] border border-[var(--color-border-2)] rounded-[6px] px-3 py-1 cursor-pointer font-semibold" onClick={onAction}>
          {action}
        </span>
      ))}
    </div>
  );
}

export function KPI({ title, value, colorClass, trendText, trendUp, barPercent }: { title: string, value: string, colorClass: string, trendText?: string, trendUp?: boolean, barPercent?: number }) {
  return (
    <Card className="flex flex-col relative overflow-hidden">
      <div className="text-[12px] tracking-[0.05em] uppercase text-[var(--color-text-dim)] mb-2">{title}</div>
      <div className={cn("font-syne text-[28px] font-semibold tracking-[-0.02em] leading-none", colorClass)}>{value}</div>
      
      {trendText && (
        <div className={cn("inline-flex items-center gap-1 text-[12px] mt-2", trendUp ? "text-[var(--color-brand-green)]" : "text-[var(--color-brand-red)]")}>
          {trendUp ? '↑' : '↓'} {trendText}
        </div>
      )}

      {barPercent !== undefined && (
        <div className="h-[3px] bg-[var(--color-border-1)] rounded-[2px] overflow-hidden mt-4 w-full">
          <div className={cn("h-full rounded-[2px] transition-all duration-700", colorClass.replace('text-', 'bg-'))} style={{ width: `${barPercent}%` }} />
        </div>
      )}
    </Card>
  );
}
