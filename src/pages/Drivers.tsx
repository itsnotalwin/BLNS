import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, daysLeft } from '@/lib/utils';
import { Search, Download, Plus } from 'lucide-react';

export default function Drivers() {
  const store = useStore();
  const [search, setSearch] = useState('');

  const filtered = store.drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.empId.toLowerCase().includes(search.toLowerCase())
  );

  const onRoute = store.drivers.filter(d => d.status === 'On Route').length;
  const prdpWarn = store.drivers.filter(d => daysLeft(d.prdpExp) < 60).length;
  const totalTrips = store.drivers.reduce((a, d) => a + d.trips, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Driver Management" 
        subtitle="PrDP tracking, hours, compliance and performance"
        actions={
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer">
              <Plus size={14} /> Add Driver
            </button>
          </>
        }
      />

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="TOTAL DRIVERS" value={store.drivers.length.toString()} colorClass="text-[var(--color-text-main)]" />
         <KPI title="ON ROUTE" value={onRoute.toString()} colorClass="text-[var(--color-brand-green)]" />
         <KPI title="PRDP EXPIRING" value={prdpWarn.toString()} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="TRIPS (MTD)" value={totalTrips.toString()} colorClass="text-[var(--color-brand-blue)]" />
      </div>

       <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, ID..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>
        <select className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-32 cursor-pointer">
          <option>All Status</option>
        </select>
      </div>

       <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Driver</Th>
                <Th>Emp ID</Th>
                <Th>Licence</Th>
                <Th>PrDP Status</Th>
                <Th>PrDP Expiry</Th>
                <Th>Countries</Th>
                <Th>Hrs (MTD)</Th>
                <Th>Trips (MTD)</Th>
                <Th>Vehicle</Th>
                <Th>Rating</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const dl = daysLeft(d.prdpExp);
                const isWarn = d.prdp === 'Renewing' || dl < 60;
                return (
                  <Tr key={d.empId}>
                    <Td className="font-semibold cursor-pointer">{d.name}</Td>
                    <Td className="font-mono text-[11px]">{d.empId}</Td>
                    <Td className="font-mono text-[11px]">{d.licence}</Td>
                    <Td><Badge status={isWarn ? 'Expiring' : 'Valid'}>{isWarn ? (d.prdp === 'Renewing' ? 'Renewing' : 'Expiring') : 'Valid'}</Badge></Td>
                    <Td className="text-[11px]">{fmtShortDate(d.prdpExp)}</Td>
                    <Td className="text-[10px]">{d.countries}</Td>
                    <Td>{d.hours}h</Td>
                    <Td>{d.trips}</Td>
                    <Td className="font-mono text-[10px] text-[var(--color-brand-accent)]">{d.vehicle || '—'}</Td>
                    <Td className="text-[11px]">{d.rating.toFixed(1)} ⭐</Td>
                    <Td><Badge status={d.status}>{d.status}</Badge></Td>
                    <Td className="flex gap-1 flex-nowrap w-max">
                      <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                      <button className="bg-[rgba(240,165,0,0.12)] border border-[rgba(240,165,0,0.2)] text-[var(--color-brand-accent)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-orange-500/20 font-bold select-none cursor-pointer">SMS</button>
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
