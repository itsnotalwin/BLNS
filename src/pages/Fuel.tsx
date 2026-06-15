import React from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, fmtR } from '@/lib/utils';
import { Download, Plus } from 'lucide-react';

export default function Fuel() {
  const store = useStore();
  
  const totalL = store.fuel.reduce((a, f) => a + f.litres, 0);
  const totalCost = store.fuel.reduce((a, f) => a + f.total, 0);
  const avgL = store.fuel.length ? (totalL / store.fuel.length).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Fuel Management" 
        subtitle="Consumption tracking, bunker cards and cost control"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--color-border-1)] text-white border border-[var(--color-border-2)] hover:brightness-110 transition-colors text-[13px] font-semibold select-none cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
              <Plus size={14} /> Log Refuel
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="MTD LITRES" value={`${totalL.toLocaleString()}L`} colorClass="text-[var(--color-text-main)]" />
         <KPI title="AVG CONSUMPTION" value={`${avgL} L/km`} colorClass="text-[var(--color-brand-blue)]" />
         <KPI title="FUEL COST (MTD)" value={fmtR(totalCost)} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="DIESEL RATE" value="R24.80/L" colorClass="text-[var(--color-brand-accent)]" />
      </div>

      <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Vehicle</Th>
                <Th>Driver</Th>
                <Th>Location</Th>
                <Th>Country</Th>
                <Th>Litres</Th>
                <Th>Rate</Th>
                <Th>Total</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {store.fuel.map((f, idx) => (
                <Tr key={idx}>
                  <Td className="text-[11px]">{fmtShortDate(f.date)}</Td>
                  <Td className="font-mono text-[10.5px] text-[var(--color-brand-accent)]">{f.vehicle}</Td>
                  <Td>{f.driver}</Td>
                  <Td className="text-[11px]">{f.location}</Td>
                  <Td className="font-mono text-[10px]">{f.country}</Td>
                  <Td className="font-semibold">{f.litres.toLocaleString()}L</Td>
                  <Td>R{f.rate.toFixed(2)}</Td>
                  <Td className="font-semibold text-[var(--color-brand-accent)]">{fmtR(f.total)}</Td>
                  <Td>
                    <button className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] px-2 py-1 text-[10px] hover:bg-[var(--color-border-1)] font-semibold select-none cursor-pointer">Del</button>
                  </Td>
                </Tr>
              ))}
              {store.fuel.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[var(--color-text-dim)]">No fuel logs found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
