import React from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, daysLeft } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function Permits() {
  const store = useStore();
  
  const expiring = store.permits.filter(p => {
    const d = daysLeft(p.expiry);
    return d > 0 && d < 60;
  }).length;
  const expired = store.permits.filter(p => daysLeft(p.expiry) <= 0).length;
  const valid = store.permits.filter(p => daysLeft(p.expiry) >= 60).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Permits & Licences" 
        subtitle="Cross-border permits, operating licences and PrDP tracking"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
            <Plus size={14} /> Add Permit
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="TOTAL PERMITS" value={store.permits.length.toString()} colorClass="text-[var(--color-text-main)]" />
         <KPI title="EXPIRING <60 DAYS" value={expiring.toString()} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="EXPIRED" value={expired.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="VALID" value={valid.toString()} colorClass="text-[var(--color-brand-green)]" />
      </div>

      <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Permit / Licence</Th>
                <Th>Vehicle / Driver</Th>
                <Th>Country</Th>
                <Th>Issued</Th>
                <Th>Expiry</Th>
                <Th>Days Left</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {store.permits.map(p => {
                const dl = daysLeft(p.expiry);
                const isWarn = dl < 60 && dl > 0;
                const isErr = dl <= 0;
                return (
                  <Tr key={p.num}>
                    <Td className="font-medium">{p.name}</Td>
                    <Td className="text-[11px]">{p.owner}</Td>
                    <Td className="text-[10px]">{p.country}</Td>
                    <Td className="text-[11px]">{fmtShortDate(p.issued)}</Td>
                    <Td className="text-[11px]">{fmtShortDate(p.expiry)}</Td>
                    <Td className={`font-bold ${isErr ? 'text-[var(--color-brand-red)]' : isWarn ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-brand-green)]'}`}>
                      {isErr ? 'EXPIRED' : dl}
                    </Td>
                    <Td><Badge status={p.status}>{p.status}</Badge></Td>
                    <Td className="flex gap-1 flex-nowrap w-max">
                      {p.status !== 'Valid' && <button className="bg-[rgba(240,165,0,0.12)] border border-[rgba(240,165,0,0.2)] text-[var(--color-brand-accent)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-orange-500/20 font-bold select-none cursor-pointer">Renew</button>}
                      <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                      <button className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-red-500/20 font-bold select-none cursor-pointer">Del</button>
                    </Td>
                  </Tr>
                );
              })}
              {store.permits.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[var(--color-text-dim)]">No permits found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
