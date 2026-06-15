import React from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, fmtR } from '@/lib/utils';
import { Download, Plus } from 'lucide-react';

export default function Maintenance() {
  const store = useStore();
  
  const inWork = store.workOrders.filter(w => w.status === 'In Progress').length;
  const sched = store.workOrders.filter(w => w.status === 'Scheduled').length;
  const cost = store.workOrders.filter(w => w.status !== 'Completed').reduce((a, w) => a + w.cost, 0);
  const done = store.workOrders.filter(w => w.status === 'Completed').length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Maintenance & Repairs" 
        subtitle="Schedule services, track work orders, manage workshop"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--color-border-1)] text-white border border-[var(--color-border-2)] hover:brightness-110 transition-colors text-[13px] font-semibold select-none cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
              <Plus size={14} /> Log Work Order
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="IN WORKSHOP" value={inWork.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="SCHEDULED (7 DAYS)" value={sched.toString()} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="MTD REPAIR COST" value={fmtR(cost)} colorClass="text-[var(--color-brand-blue)]" />
         <KPI title="COMPLETED MTD" value={done.toString()} colorClass="text-[var(--color-brand-green)]" />
      </div>

      <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>WO #</Th>
                <Th>Vehicle</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th>Workshop</Th>
                <Th>Opened</Th>
                <Th>ETA Done</Th>
                <Th>Cost (R)</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {store.workOrders.map(w => (
                <Tr key={w.no}>
                  <Td className="font-mono text-[var(--color-brand-accent)] cursor-pointer">{w.no}</Td>
                  <Td className="font-mono text-[var(--color-brand-accent)]">{w.vehicle}</Td>
                  <Td className="text-[11px]">{w.type}</Td>
                  <Td className="text-[11px] max-w-[180px] truncate" title={w.desc}>{w.desc}</Td>
                  <Td className="text-[11px]">{w.workshop}</Td>
                  <Td className="text-[11px]">{fmtShortDate(w.opened)}</Td>
                  <Td className="text-[11px]">{fmtShortDate(w.eta)}</Td>
                  <Td className="font-semibold">{fmtR(w.cost)}</Td>
                  <Td><Badge status={w.status}>{w.status}</Badge></Td>
                  <Td className="flex gap-1 flex-nowrap w-max">
                    {w.status !== 'Completed' && <button className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)] text-[var(--color-brand-green)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-green-500/20 font-bold select-none cursor-pointer">Complete</button>}
                    <button className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-red-500/20 font-bold select-none cursor-pointer">Del</button>
                  </Td>
                </Tr>
              ))}
              {store.workOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-[var(--color-text-dim)]">No work orders found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
