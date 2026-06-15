import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'status' | 'custom';
  status?: string;
  className?: string;
}

export function Badge({ children, variant = 'status', status, className, ...props }: BadgeProps) {
  let colors = { bg: 'bg-[var(--color-surface-2)]', text: 'text-[var(--color-text-muted)]', border: 'border-[var(--color-border-2)]' };
  
  if (variant === 'status' && status) {
    colors = getStatusColor(status);
  }

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[9.5px] font-semibold whitespace-nowrap font-mono tracking-wide border",
        colors.bg, colors.text, colors.border,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
