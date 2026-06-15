import React from 'react';

export default function PageHeader({ title, subtitle, actions }: { title: string, subtitle: string, actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 pt-8 pb-2">
      <div>
        <div className="font-syne text-[24px] font-semibold tracking-tight">{title}</div>
        <div className="text-[var(--color-text-muted)] text-[13px] mt-1">{subtitle}</div>
      </div>
      {actions && (
        <div className="flex gap-3 mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
