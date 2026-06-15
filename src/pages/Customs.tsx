import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { Search, Plus } from 'lucide-react';

export default function Customs() {
  const store = useStore();
  const [search, setSearch] = useState('');

  const filtered = store.customs.filter(c => 
    c.awb.toLowerCase().includes(search.toLowerCase()) || 
    c.border.toLowerCase().includes(search.toLowerCase())
  );

  const pending = store.customs.filter(c => c.status !== 'Cleared').length;
  const cleared = store.customs.filter(c => c.status === 'Cleared').length;
  const holds = store.customs.filter(c => c.status.includes('Hold')).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Border Clearance & Customs" 
        subtitle="Monitor all customs declarations and border clearance status"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
            <Plus size={14} /> Submit Declaration
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="PENDING CLEARANCE" value={pending.toString()} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="CLEARED TODAY" value={cleared.toString()} colorClass="text-[var(--color-brand-green)]" />
         <KPI title="HOLDS / QUERIES" value={holds.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="AVG CLEARANCE (H)" value="2.4h" colorClass="text-[var(--color-brand-blue)]" />
      </div>

       <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search AWB, border..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>
      </div>

      <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>AWB</Th>
                <Th>Border</Th>
                <Th>Country</Th>
                <Th>Commodity</Th>
                <Th>Docs</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <Tr key={c.awb}>
                  <Td className="font-mono text-[var(--color-brand-accent)] cursor-pointer">{c.awb}</Td>
                  <Td>{c.border}</Td>
                  <Td className="text-[11px]">{c.country}</Td>
                  <Td className="text-[11px]">{c.commodity}</Td>
                  <Td className="font-mono text-[10px]">
                    <span className={c.docsOk < c.docsTotal ? "text-[var(--color-brand-red)]" : "text-[var(--color-brand-green)]"}>
                      {c.docsOk}/{c.docsTotal}
                    </span>
                  </Td>
                  <Td><Badge status={c.status}>{c.status}</Badge></Td>
                  <Td className="flex gap-1 flex-nowrap w-max">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                    {c.status !== 'Cleared' && <button className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)] text-[var(--color-brand-green)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-green-500/20 font-bold select-none cursor-pointer">Clear</button>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
