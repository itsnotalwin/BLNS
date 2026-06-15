import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, cn } from '@/lib/utils';
import { Search, Download, Plus } from 'lucide-react';

export default function Fleet() {
  const store = useStore();
  const [search, setSearch] = useState('');

  const filtered = store.fleet.filter(f => 
    f.unit.toLowerCase().includes(search.toLowerCase()) || 
    f.reg.toLowerCase().includes(search.toLowerCase()) ||
    f.make.toLowerCase().includes(search.toLowerCase())
  );

  const run = store.fleet.filter(f => f.status === 'Running').length;
  const work = store.fleet.filter(f => f.status === 'Breakdown' || f.status === 'In Workshop').length;
  const idle = store.fleet.filter(f => f.status === 'Idle').length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Fleet Management" 
        subtitle="Vehicles, utilisation and maintenance status"
        actions={
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer">
              <Plus size={14} /> Add Vehicle
            </button>
          </>
        }
      />

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="TOTAL FLEET" value={store.fleet.length.toString()} colorClass="text-[var(--color-text-main)]" />
         <KPI title="RUNNING" value={run.toString()} colorClass="text-[var(--color-brand-green)]" barPercent={(run/Math.max(store.fleet.length,1))*100} />
         <KPI title="IN WORKSHOP" value={work.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="IDLE / AVAILABLE" value={idle.toString()} colorClass="text-[var(--color-brand-blue)]" />
      </div>

       <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search unit, reg, make..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>
        <select className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-32 cursor-pointer">
          <option>All Types</option>
        </select>
        <select className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-32 cursor-pointer">
          <option>All Status</option>
        </select>
      </div>

       <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Unit</Th>
                <Th>Make / Model</Th>
                <Th>Type</Th>
                <Th>Reg</Th>
                <Th>Payload(T)</Th>
                <Th>Odometer</Th>
                <Th>Next Service</Th>
                <Th>Insurance Exp</Th>
                <Th>Cross-Border</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const kmToSvc = f.nextService - f.odometer;
                const svcColor = kmToSvc < 2000 ? 'text-[var(--color-brand-red)]' : kmToSvc < 5000 ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-brand-green)]';
                return (
                  <Tr key={f.unit}>
                    <Td className="font-mono text-[var(--color-brand-accent)] cursor-pointer">{f.unit}</Td>
                    <Td>{f.make} {f.model}</Td>
                    <Td>{f.type}</Td>
                    <Td className="font-mono text-[10px]">{f.reg}</Td>
                    <Td>{f.payload}</Td>
                    <Td className="font-mono">{f.odometer.toLocaleString()}km</Td>
                    <Td className={cn("font-mono font-semibold", svcColor)}>{kmToSvc.toLocaleString()}km</Td>
                    <Td>{fmtShortDate(f.insurance)}</Td>
                    <Td className="text-[10px]">{f.crossBorder || '—'}</Td>
                    <Td><Badge status={f.status}>{f.status}</Badge></Td>
                    <Td className="flex gap-1 flex-nowrap w-max">
                      <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                      <button className="bg-[rgba(240,165,0,0.12)] border border-[rgba(240,165,0,0.2)] text-[var(--color-brand-accent)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-orange-500/20 font-bold select-none cursor-pointer">Service</button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
