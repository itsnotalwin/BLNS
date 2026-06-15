import React, { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Truck, Search } from 'lucide-react';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const unreadCount = useStore(state => state.notifications.filter(n => n.unread).length);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-[64px] bg-[var(--color-surface-base)] border-b border-[var(--color-border-1)] flex items-center px-8 justify-between shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-syne text-[18px] font-bold tracking-tight shrink-0">
          <div className="w-6 h-6 bg-[var(--color-brand-accent)] rounded-[4px] flex items-center justify-center text-[13px] text-black">
            <Truck size={14} strokeWidth={2.5} />
          </div>
          <span>Trans<span className="text-[var(--color-brand-accent)]">Africa</span></span>
        </div>
        
        <div className="font-mono text-[9px] px-2 py-1 rounded-[3px] bg-[rgba(16,185,129,0.1)] text-[var(--color-brand-accent)] border border-[rgba(16,185,129,0.2)]">
          BLNS OPS
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 hidden md:flex">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            placeholder="Search shipment, vehicle, driver..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] w-[180px] font-sans placeholder-[var(--color-text-dim)]"
          />
        </div>

        <div className="font-mono text-[11px] text-[var(--color-text-muted)] hidden sm:block">
          {time.toLocaleTimeString('en-ZA', { hour12: false })} SAST
        </div>

        <div className="flex items-center gap-1.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-[5px] px-2.5 py-1.5 text-[var(--color-brand-red)] text-[11px] font-semibold cursor-pointer select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-red)] animate-pulse-dot" />
          <span>{unreadCount} Alerts</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-[var(--color-border-2)] flex items-center justify-center text-[12px] font-medium cursor-pointer text-[var(--color-text-main)] select-none">
          AW
        </div>
      </div>
    </header>
  );
}
