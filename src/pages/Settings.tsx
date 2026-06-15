import React from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';

export default function Settings() {
  const store = useStore();
  const s = store.settings;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Settings" 
        subtitle="Company profile, alert thresholds and system config"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8">
        <Card>
          <CardHeader title="Company Profile" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">Company Name</label>
              <input className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.company} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">VAT Number</label>
              <input className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.vat} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">SARS Client Code</label>
              <input className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.sars} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">Head Office</label>
              <input className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.office} />
            </div>
            <button className="bg-white text-black font-bold text-[13px] rounded-[6px] py-2 px-4 mt-2 hover:bg-gray-200 self-start">Save Company Profile</button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Alert Thresholds" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">Border Wait Alert (hours)</label>
              <input type="number" className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.borderAlert} />
            </div>
             <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">Permit Expiry Warning (days)</label>
              <input type="number" className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.permitWarn} />
            </div>
             <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wide uppercase">Service Warning (km before due)</label>
              <input type="number" className="w-full bg-[var(--color-surface-base)] border border-[var(--color-border-2)] rounded-[5px] px-3 py-2 text-[var(--color-text-main)] text-[12px] outline-none focus:border-[var(--color-brand-accent)] transition-colors" defaultValue={s.serviceWarn} />
            </div>
            <button className="bg-white text-black font-bold text-[13px] rounded-[6px] py-2 px-4 mt-2 hover:bg-gray-200 self-start">Save Thresholds</button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-border-1)]">
            <CardHeader title="Danger Zone" />
            <div className="flex gap-3">
              <button className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] font-bold text-[13px] rounded-[6px] py-2 px-4 hover:bg-red-500/20">⚠ Reset All Data</button>
              <button className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] font-bold text-[13px] rounded-[6px] py-2 px-4 hover:bg-red-500/20">🗑 Clear Activity</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
