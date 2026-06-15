import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  Box, Map, Truck, User, ShieldCheck, FileText, 
  FileBadge2, Banknote, Fuel, Activity, PenTool, LayoutDashboard, Settings, Building2
} from 'lucide-react';

const navSections = [
  {
    title: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', badge: null },
      { id: 'shipments', label: 'Shipments', icon: Box, path: '/shipments', badge: (s: any) => s.shipments.filter((x:any)=>x.status==='In Transit').length, badgeColor: 'bg-[rgba(240,165,0,.15)] text-[var(--color-brand-accent)]' },
      { id: 'warehouse', label: 'Overnight Warehouse', icon: Building2, path: '/warehouse', badge: (s: any) => s.warehouseConsignments ? s.warehouseConsignments.filter((x: any) => x.status === 'Stored' || x.status === 'Inspecting').length : 0, badgeColor: 'bg-[rgba(99,102,241,0.15)] text-indigo-400' },
      { id: 'routes', label: 'Routes & Corridors', icon: Map, path: '/routes', badge: null },
      { id: 'fleet', label: 'Fleet Management', icon: Truck, path: '/fleet', badge: (s: any) => s.fleet.filter((x:any)=>x.status==='Breakdown'||x.status==='Service Due').length, badgeColor: 'bg-[rgba(239,68,68,.15)] text-[var(--color-brand-red)]' },
      { id: 'drivers', label: 'Drivers', icon: User, path: '/drivers', badge: null },
    ]
  },
  {
    title: 'Customs & Compliance',
    items: [
      { id: 'customs', label: 'Border Clearance', icon: ShieldCheck, path: '/customs', badge: (s: any) => s.customs.filter((x:any)=>x.status.includes('Hold')).length, badgeColor: 'bg-[rgba(239,68,68,.15)] text-[var(--color-brand-red)]' },
      { id: 'documents', label: 'Documents', icon: FileText, path: '/documents', badge: null },
      { id: 'permits', label: 'Permits & Licences', icon: FileBadge2, path: '/permits', badge: (s: any) => s.permits.filter((x:any)=>x.status==='Expiring'||x.status==='Expired').length, badgeColor: 'bg-[rgba(240,165,0,.15)] text-[var(--color-brand-accent)]' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { id: 'finance', label: 'Finance & Invoicing', icon: Banknote, path: '/finance', badge: null },
      { id: 'fuel', label: 'Fuel Management', icon: Fuel, path: '/fuel', badge: null },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { id: 'analytics', label: 'Analytics', icon: Activity, path: '/analytics', badge: null },
      { id: 'maintenance', label: 'Maintenance', icon: PenTool, path: '/maintenance', badge: null },
      { id: 'customers', label: 'Customers / CRM', icon: Building2, path: '/customers', badge: null },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', badge: null },
    ]
  }
];

export default function Sidebar() {
  const store = useStore();

  return (
    <div className="w-[240px] shrink-0 bg-[var(--color-surface-1)] border-r border-[var(--color-border-1)] flex flex-col overflow-y-auto">
      {navSections.map((section, idx) => (
        <div key={idx} className="pb-4 pt-4 first:pt-6">
          <div className="text-[12px] tracking-[0.05em] text-[var(--color-text-dim)] uppercase px-6 pb-2 font-medium">
            {section.title}
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            const bVal = item.badge ? item.badge(store) : 0;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-6 py-3 text-[14px] transition-all select-none cursor-pointer",
                  isActive 
                    ? "bg-[#1c1c1f] text-[var(--color-text-main)] border-l-2 border-[var(--color-brand-accent)] pl-[22px]" 
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-main)] border-l-2 border-transparent"
                )}
              >
                <Icon size={16} className="text-center shrink-0" />
                <span>{item.label}</span>
                {bVal > 0 && (
                  <span className={cn("ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded-[8px] font-semibold", item.badgeColor)}>
                    {bVal}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
      <div className="mt-auto h-[40px] border-t border-[var(--color-border-1)] text-[11px] text-[var(--color-text-dim)] flex items-center px-6 gap-4 bg-[var(--color-surface-1)]">
        <span className="flex items-center gap-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--color-brand-accent)] before:inline-block">
          All systems operational
        </span>
        <span className="ml-auto font-mono">v3.0</span>
      </div>
    </div>
  );
}
