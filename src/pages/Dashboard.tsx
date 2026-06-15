import React from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fmtR, fmtShortDate, flagFor } from '@/lib/utils';
import { ArrowDownToLine, Calculator, Plus } from 'lucide-react';
import CorridorMap from '@/components/CorridorMap';

export default function Dashboard() {
  const store = useStore();
  const dateStr = new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' · BLNS Corridor Network';

  const activeShipments = store.shipments.filter(s => s.status === 'In Transit').length;
  const activePercent = Math.round((activeShipments / Math.max(store.shipments.length, 1)) * 100);
  
  const utilFleet = store.fleet.filter(f => f.status === 'Running').length;
  const utilPercent = Math.round((utilFleet / Math.max(store.fleet.length, 1)) * 100);

  const holds = store.customs.filter(c => c.status.includes('Hold')).length;
  const holdsPercent = Math.round((holds / Math.max(store.shipments.length, 1)) * 100);

  const revenue = store.invoices.reduce((a, i) => a + i.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Operations Overview" 
        subtitle={dateStr}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--color-border-1)] text-white border border-[var(--color-border-2)] hover:brightness-110 transition-colors text-[13px] font-semibold select-none cursor-pointer">
              <ArrowDownToLine size={14} /> Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--color-border-1)] text-white border border-[var(--color-border-2)] hover:brightness-110 transition-colors text-[13px] font-semibold select-none cursor-pointer">
              <Calculator size={14} /> Get Quote
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold select-none cursor-pointer border-none">
              <Plus size={14} /> New Shipment
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-8">
        <KPI title="ACTIVE SHIPMENTS" value={activeShipments.toString()} colorClass="text-[var(--color-brand-accent)]" trendText={`${activeShipments + 2} active shipments`} trendUp={true} barPercent={activePercent} />
        <KPI title="FLEET UTILISATION" value={`${utilPercent}%`} colorClass="text-[var(--color-brand-green)]" trendText="▲ —" trendUp={true} barPercent={utilPercent} />
        <KPI title="BORDER HOLDS" value={holds.toString()} colorClass="text-[var(--color-brand-red)]" trendText="— since yesterday" trendUp={false} barPercent={holdsPercent} />
        <KPI title="MONTHLY REVENUE" value={fmtR(revenue)} colorClass="text-[var(--color-brand-blue)]" trendText="▲ —" trendUp={true} barPercent={68} />
      </div>

      <div className="px-8">
        <CorridorMap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8">
        <Card className="lg:col-span-2 p-0">
          <div className="p-3.5 border-b border-[var(--color-border-1)]">
            <CardHeader title="Recent Shipments" action="View all →" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left collapse">
              <thead>
                <tr>
                  <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2 px-3 border-b border-[var(--color-border-1)] font-medium">AWB</th>
                  <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2 px-3 border-b border-[var(--color-border-1)] font-medium">Route</th>
                  <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2 px-3 border-b border-[var(--color-border-1)] font-medium">Commodity</th>
                  <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2 px-3 border-b border-[var(--color-border-1)] font-medium">Wt(T)</th>
                  <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2 px-3 border-b border-[var(--color-border-1)] font-medium">Status</th>
                  <th className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-dim)] py-2 px-3 border-b border-[var(--color-border-1)] font-medium">ETA</th>
                </tr>
              </thead>
              <tbody>
                {store.shipments.slice(0, 6).map(s => (
                  <tr key={s.id} className="hover:bg-[var(--color-surface-2)] cursor-pointer group">
                    <td className="py-2.5 px-3 text-[11px] font-mono text-[var(--color-brand-accent)] border-b border-[var(--color-border-1)] group-last:border-none">{s.id}</td>
                    <td className="py-2.5 px-3 text-[11.5px] border-b border-[var(--color-border-1)] group-last:border-none">🇿🇦 {s.origin} → {flagFor(s.country)} {s.destCity}</td>
                    <td className="py-2.5 px-3 text-[11.5px] border-b border-[var(--color-border-1)] group-last:border-none">{s.commodity}</td>
                    <td className="py-2.5 px-3 text-[11.5px] border-b border-[var(--color-border-1)] group-last:border-none">{s.weight}</td>
                    <td className="py-2.5 px-3 border-b border-[var(--color-border-1)] group-last:border-none"><Badge status={s.status}>{s.status}</Badge></td>
                    <td className="py-2.5 px-3 text-[11.5px] border-b border-[var(--color-border-1)] group-last:border-none">{fmtShortDate(s.eta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Border Status" actionNode={<Badge>Live</Badge>} />
          <div className="flex flex-col">
            {store.borders.map(b => (
              <div key={b.name} className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border-1)] last:border-none">
                <div className="w-7 h-7 rounded-[5px] bg-[#f0a50014] text-[11px] flex items-center justify-center shrink-0">
                  {b.countries.split('/')[1]}
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold">{b.name}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{b.countries} · Wait: {b.wait}h</div>
                </div>
                <Badge status={b.status}>{b.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
