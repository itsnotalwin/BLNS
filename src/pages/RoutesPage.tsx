import React from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { Map, Plus, Download } from 'lucide-react';
import CorridorMap from '@/components/CorridorMap';

export default function RoutesPage() {
  const store = useStore();
  
  const op = store.routes.filter(r => r.status === 'Operational').length;
  const del = store.routes.filter(r => r.status === 'Delayed' || r.status === 'Congested').length;
  const avg = (store.routes.reduce((a, r) => a + r.avgTime, 0) / Math.max(store.routes.length, 1)).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Routes & Corridors" 
        subtitle="BLNS corridor performance, distances and border data"
        actions={
          <>
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] select-none cursor-pointer text-[var(--color-text-main)]">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer">
              <Plus size={14} /> Add Corridor
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="TOTAL CORRIDORS" value={store.routes.length.toString()} colorClass="text-[var(--color-text-main)]" />
         <KPI title="OPERATIONAL" value={op.toString()} colorClass="text-[var(--color-brand-green)]" />
         <KPI title="WITH DELAYS" value={del.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="AVG TRANSIT (H)" value={`${avg}h`} colorClass="text-[var(--color-brand-blue)]" />
      </div>

      <div className="px-8">
        <CorridorMap />
      </div>

      <div className="px-8">
        <Card className="p-0">
           <div className="p-3.5 border-b border-[var(--color-border-1)]">
            <CardHeader title="Corridor Register" />
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Corridor</Th>
                <Th>From</Th>
                <Th>To</Th>
                <Th>KM</Th>
                <Th>Border Post(s)</Th>
                <Th>Avg Transit</Th>
                <Th>Current Wait</Th>
                <Th>Active Ships</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {store.routes.map(r => (
                <Tr key={r.name}>
                  <Td className="font-semibold">{r.name}</Td>
                  <Td>🇿🇦 {r.from}</Td>
                  <Td>{r.to}</Td>
                  <Td className="font-mono">{r.km}</Td>
                  <Td className="text-[10px]">{r.border}</Td>
                  <Td>{r.avgTime}h</Td>
                  <Td className={`font-semibold ${r.wait>4?'text-[var(--color-brand-red)]':r.wait>2?'text-[var(--color-brand-accent)]':'text-[var(--color-brand-green)]'}`}>{r.wait}h</Td>
                  <Td>{r.activeShips}</Td>
                  <Td><Badge status={r.status}>{r.status}</Badge></Td>
                  <Td className="flex gap-1">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-white/10 select-none cursor-pointer font-semibold">View</button>
                    <button className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-red-500/20 select-none cursor-pointer font-bold">Del</button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8">
        <Card className="p-0">
           <div className="p-3.5 border-b border-[var(--color-border-1)]">
             <CardHeader title="Border Post Status" actionNode={<button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] px-2 py-1 rounded-[4px] text-[10px] hover:bg-[var(--color-border-1)] font-semibold text-[var(--color-text-main)]">+ Add Border</button>} />
           </div>
           <Table>
            <thead>
              <tr>
                <Th>Post</Th>
                <Th>Countries</Th>
                <Th>Wait Time</Th>
                <Th>Status</Th>
                <Th>Trucks Waiting</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {store.borders.map(b => (
                <Tr key={b.name}>
                  <Td className="font-semibold">{b.name}</Td>
                  <Td>{b.countries}</Td>
                  <Td className={`font-semibold ${b.wait>4?'text-[var(--color-brand-red)]':b.wait>2?'text-[var(--color-brand-accent)]':'text-[var(--color-brand-green)]'}`}>{b.wait}h</Td>
                  <Td><Badge status={b.status}>{b.status}</Badge></Td>
                  <Td>{b.trucks}</Td>
                  <Td className="flex gap-1">
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-white/10 select-none cursor-pointer font-semibold">Update Wait</button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
           <CardHeader title="Corridor Performance" />
           <div className="flex flex-col">
             {store.routes.map(r => (
               <div key={r.name} className="py-2 border-b border-[var(--color-border-1)] last:border-none">
                 <div className="flex justify-between text-[12px] mb-[3px]">
                   <span className="font-semibold">{r.name}</span>
                   <span className="text-[var(--color-text-muted)]">{r.activeShips} active</span>
                 </div>
                 <div className="h-[3px] bg-[var(--color-border-1)] rounded-[2px] overflow-hidden mt-[3px]">
                   <div 
                     className="h-full transition-all duration-1000" 
                     style={{ 
                        width: `${Math.min((r.activeShips/30)*100, 100)}%`,
                        backgroundColor: r.status==='Delayed' ? 'var(--color-brand-red)' : r.status==='Congested' ? 'var(--color-brand-accent)' : 'var(--color-brand-green)'
                     }} 
                   />
                 </div>
               </div>
             ))}
           </div>
        </Card>
      </div>
    </div>
  );
}
