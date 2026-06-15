import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className={cn("w-full text-left collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2.5 px-3 border-b border-[var(--color-border-1)] font-medium whitespace-nowrap">{children}</th>;
}

export function Td({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("py-2.5 px-3 text-[11.5px] border-b border-[var(--color-border-1)] group-last:border-none", className)} {...props}>{children}</td>;
}

export function Tr({ children, onClick, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr onClick={onClick} className={cn("group transition-colors", onClick ? "hover:bg-[var(--color-surface-2)] cursor-pointer" : "", className)} {...props}>{children}</tr>;
}
