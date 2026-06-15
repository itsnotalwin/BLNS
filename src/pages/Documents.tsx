import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate } from '@/lib/utils';
import { Search, Plus } from 'lucide-react';

export default function Documents() {
  const store = useStore();
  const [search, setSearch] = useState('');

  const filtered = store.documents.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.shipment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Document Management" 
        subtitle="All shipping, customs and compliance documents"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
            <Plus size={14} /> Upload Document
          </button>
        }
      />

       <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search document..." 
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
                <Th>Document Name</Th>
                <Th>Type</Th>
                <Th>Shipment</Th>
                <Th>Country</Th>
                <Th>Uploaded</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx) => (
                <Tr key={idx}>
                  <Td className="font-medium text-[12px]">{d.name}</Td>
                  <Td><Badge>{d.type}</Badge></Td>
                  <Td className="font-mono text-[10px]">{d.shipment}</Td>
                  <Td className="text-[11px]">{d.country}</Td>
                  <Td className="text-[11px]">{fmtShortDate(d.uploaded)}</Td>
                  <Td className="text-[11px]">{fmtShortDate(d.expiry)}</Td>
                  <Td><Badge status={d.status}>{d.status}</Badge></Td>
                  <Td className="flex gap-1 flex-nowrap w-max">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">View</button>
                    <button className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-red-500/20 font-bold select-none cursor-pointer">Del</button>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[var(--color-text-dim)]">No documents found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
