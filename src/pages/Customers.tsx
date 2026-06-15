import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtR } from '@/lib/utils';
import { Search, Download, Plus } from 'lucide-react';

export default function Customers() {
  const store = useStore();
  const [search, setSearch] = useState('');

  const filtered = store.customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Customer Management (CRM)" 
        subtitle="Accounts, contacts, freight history and credit"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--color-border-1)] text-white border border-[var(--color-border-2)] hover:brightness-110 transition-colors text-[13px] font-semibold select-none cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
              <Plus size={14} /> Add Customer
            </button>
          </>
        }
      />

       <div className="px-8">
        <Card className="p-0 flex flex-col">
          <div className="p-3.5 border-b border-[var(--color-border-1)] flex justify-between items-center bg-[var(--color-surface-base)]">
            <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2 py-1.5 min-w-[200px]">
              <Search size={12} className="text-[var(--color-text-dim)]" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customer..." 
                className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
              />
            </div>
            <select className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-32 cursor-pointer">
              <option>All Status</option>
            </select>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Customer</Th>
                <Th>Country</Th>
                <Th>Contact</Th>
                <Th>Ships(MTD)</Th>
                <Th>Revenue(MTD)</Th>
                <Th>Outstanding</Th>
                <Th>Credit Limit</Th>
                <Th>Tier</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <Tr key={c.name}>
                  <Td className="font-semibold cursor-pointer">{c.name}</Td>
                  <Td className="text-[11px]">{c.country}</Td>
                  <Td className="text-[11px]">{c.email}</Td>
                  <Td>{c.ships}</Td>
                  <Td className="font-semibold">{fmtR(c.revenue)}</Td>
                  <Td className={`font-semibold ${c.outstanding > 0 ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-brand-green)]'}`}>{c.outstanding > 0 ? fmtR(c.outstanding) : '—'}</Td>
                  <Td>{fmtR(c.credit)}</Td>
                  <Td><Badge>{c.tier}</Badge></Td>
                  <Td><Badge status={c.status}>{c.status}</Badge></Td>
                  <Td className="flex gap-1 flex-nowrap w-max">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                    <button className="bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.2)] text-[var(--color-brand-blue)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-blue-500/20 font-bold select-none cursor-pointer">Invoice</button>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-[var(--color-text-dim)]">No customers found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
