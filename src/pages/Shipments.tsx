import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, flagFor } from '@/lib/utils';
import { Search, Download, Plus } from 'lucide-react';

export default function Shipments() {
  const shipments = useStore(state => state.shipments);
  const [search, setSearch] = useState('');

  const filtered = shipments.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    s.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Shipments" 
        subtitle="Full freight movement management across BLNS"
        actions={
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] select-none cursor-pointer">
              <Download size={14} /> Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer">
              <Plus size={14} /> New Shipment
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search AWB, customer, driver..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>
        <select className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-32 cursor-pointer">
          <option>All Countries</option>
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
                <Th>AWB</Th>
                <Th>Customer</Th>
                <Th>Origin</Th>
                <Th>Destination</Th>
                <Th>Commodity</Th>
                <Th>WT(T)</Th>
                <Th>Vehicle</Th>
                <Th>Driver</Th>
                <Th>Border</Th>
                <Th>Status</Th>
                <Th>ETA</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <Tr key={s.id}>
                  <Td className="font-mono text-[var(--color-brand-accent)] cursor-pointer">{s.id}</Td>
                  <Td>{s.customer}</Td>
                  <Td>🇿🇦 {s.origin}</Td>
                  <Td>{flagFor(s.country)} {s.destCity}</Td>
                  <Td>{s.commodity}</Td>
                  <Td>{s.weight}</Td>
                  <Td className="font-mono text-[10px] text-[var(--color-brand-accent)]">{s.vehicle || '—'}</Td>
                  <Td>{s.driver || 'Unassigned'}</Td>
                  <Td className="text-[10px]">{s.border || '—'}</Td>
                  <Td><Badge status={s.status}>{s.status}</Badge></Td>
                  <Td>{fmtShortDate(s.eta)}</Td>
                  <Td className="flex gap-1 flex-nowrap shrink-0 w-max">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                    {s.status === 'Pending' && <button className="bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.2)] text-[var(--color-brand-blue)] rounded-[3px] px-2 py-1 text-[10px] font-bold select-none cursor-pointer hover:bg-blue-500/20">Dispatch</button>}
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-[var(--color-text-dim)]">No shipments found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
      
      <div className="px-8 text-[11px] text-[var(--color-text-muted)]">
        Showing {filtered.length} of {shipments.length} shipments
      </div>
    </div>
  );
}
