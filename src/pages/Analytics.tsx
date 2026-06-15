import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const countryData = [
  { name: 'SA', value: 145 },
  { name: 'NA', value: 89 },
  { name: 'BW', value: 64 },
  { name: 'SZ', value: 34 },
];

const revenueData = [
  { month: 'Jan', revenue: 420 },
  { month: 'Feb', revenue: 380 },
  { month: 'Mar', revenue: 510 },
  { month: 'Apr', revenue: 490 },
  { month: 'May', revenue: 580 },
  { month: 'Jun', revenue: 620 },
];

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Analytics & Reporting" 
        subtitle="Performance insights and business intelligence"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--color-border-1)] text-white border border-[var(--color-border-2)] hover:brightness-110 transition-colors text-[13px] font-semibold select-none cursor-pointer">
            <Download size={14} /> Export All Data
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8">
        <Card>
          <CardHeader title="Shipments by Country (MTD)" />
          <div className="h-[250px] mt-4 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-dim)" axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-text-dim)" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-base)', borderColor: 'var(--color-border-2)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-main)' }}
                />
                <Bar dataKey="value" fill="var(--color-brand-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue Trend (6 Months) - in R 000s" />
           <div className="h-[250px] mt-4 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-1)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-text-dim)" axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-text-dim)" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-base)', borderColor: 'var(--color-border-2)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text-main)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-brand-green)" strokeWidth={3} dot={{ fill: 'var(--color-surface-1)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
        <Card>
          <CardHeader title="On-Time Delivery" />
          <div className="flex flex-col items-center py-3">
            <div className="font-syne text-[44px] font-extrabold text-[var(--color-brand-green)]">87%</div>
            <div className="text-[var(--color-text-muted)] text-[11px] mt-1">Delivered on or before ETA</div>
            <div className="w-full h-1.5 bg-[var(--color-border-1)] rounded overflow-hidden mt-3">
              <div className="h-full bg-[var(--color-brand-green)] w-[87%]" />
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Border Delay Rate" />
           <div className="flex flex-col items-center py-3">
            <div className="font-syne text-[44px] font-extrabold text-[var(--color-brand-accent)]">22%</div>
            <div className="text-[var(--color-text-muted)] text-[11px] mt-1">Shipments with border delays</div>
            <div className="w-full h-1.5 bg-[var(--color-border-1)] rounded overflow-hidden mt-3">
              <div className="h-full bg-[var(--color-brand-accent)] w-[22%]" />
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Cost Per KM" />
           <div className="flex flex-col items-center py-3">
            <div className="font-syne text-[44px] font-extrabold text-[var(--color-brand-blue)]">R8.40</div>
            <div className="text-[var(--color-text-muted)] text-[11px] mt-1">Fully loaded cost per km</div>
            <div className="inline-flex items-center gap-1 text-[12px] mt-3 bg-[rgba(239,68,68,0.12)] text-[var(--color-brand-red)] px-1.5 py-0.5 rounded-[3px] font-semibold">
              ↑ 3% from diesel increase
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
