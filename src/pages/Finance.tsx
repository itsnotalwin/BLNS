import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, fmtR } from '@/lib/utils';
import { Search, Download, Plus } from 'lucide-react';

export default function Finance() {
  const store = useStore();
  const [search, setSearch] = useState('');

  const filtered = store.invoices.filter(i => 
    i.no.toLowerCase().includes(search.toLowerCase()) || 
    i.customer.toLowerCase().includes(search.toLowerCase())
  );

  const rev = store.invoices.reduce((a, i) => a + i.amount, 0);
  const out = store.invoices.filter(i => i.status !== 'Paid').reduce((a, i) => a + i.amount, 0);
  const fuelCost = store.fuel.reduce((a, f) => a + f.total, 0);
  const margin = rev > 0 ? ((rev - fuelCost * 4) / rev * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Finance & Invoicing" 
        subtitle="Revenue, invoices, costs and profitability"
        actions={
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer">
              <Download size={14} /> Export
            </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer">
              <Plus size={14} /> Create Invoice
            </button>
          </>
        }
      />

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="MTD REVENUE" value={fmtR(rev)} colorClass="text-[var(--color-brand-green)]" />
         <KPI title="OUTSTANDING" value={fmtR(out)} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="FUEL COSTS" value={fmtR(fuelCost)} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="NET MARGIN" value={`${margin}%`} colorClass="text-[var(--color-brand-blue)]" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8">
        <Card className="lg:col-span-2 p-0 flex flex-col">
          <div className="p-3.5 border-b border-[var(--color-border-1)] flex justify-between items-center group">
             <span className="font-syne text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Invoices</span>
             <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2 py-1 max-w-[150px]">
                <Search size={10} className="text-[var(--color-text-dim)]" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[10px] font-sans w-full placeholder-[var(--color-text-dim)]"
                />
              </div>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>INV #</Th>
                <Th>Customer</Th>
                <Th>Amount</Th>
                <Th>Issued</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <Tr key={i.no}>
                  <Td className="font-mono text-[var(--color-brand-accent)] cursor-pointer">{i.no}</Td>
                  <Td>{i.customer}</Td>
                  <Td className="font-semibold">{fmtR(i.amount)}</Td>
                  <Td className="text-[11px]">{fmtShortDate(i.issued)}</Td>
                  <Td className="text-[11px]">{fmtShortDate(i.due) || '—'}</Td>
                  <Td><Badge status={i.status}>{i.status}</Badge></Td>
                  <Td className="flex gap-1 flex-nowrap w-max">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                    {i.status !== 'Paid' && <button className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)] text-[var(--color-brand-green)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-green-500/20 font-bold select-none cursor-pointer">Mark Paid</button>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
           <CardHeader title="Cost Breakdown (MTD)" />
           <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-1)] text-[12px]">
               <span className="text-[var(--color-text-main)]">Diesel & Fuel</span>
               <span className="font-semibold">{fmtR(fuelCost)}</span>
             </div>
             <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-1)] text-[12px]">
               <span className="text-[var(--color-text-main)]">Driver Wages</span>
               <span className="font-semibold">{fmtR(store.drivers.length * 18000)}</span>
             </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-1)] text-[12px]">
               <span className="text-[var(--color-text-main)]">Cross-Border Permits</span>
               <span className="font-semibold">R145,000</span>
             </div>
             <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-1)] text-[12px]">
               <span className="text-[var(--color-text-main)]">Customs & Clearing</span>
               <span className="font-semibold">R89,000</span>
             </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border-1)] text-[12px] font-bold text-[var(--color-brand-accent)] mt-1">
               <span>GROSS PROFIT</span>
               <span>{fmtR(rev - fuelCost)}  ({margin}%)</span>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
