import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtR, fmtDate } from '@/lib/utils';
import { 
  Building2, Search, Plus, Filter, Clock, Banknote, ShieldAlert,
  ArrowUpRight, CheckCircle2, ChevronRight, X, Sparkles, HelpCircle
} from 'lucide-react';
import { WarehouseConsignment } from '@/types';

export default function WarehousePage() {
  const store = useStore();
  const { warehouseConsignments, shipments, addWarehouseConsignment, updateWarehouseConsignment, deleteWarehouseConsignment, addActivity } = store;

  const [search, setSearch] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('All Warehouses');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState('All Reasons');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseConsignment | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    id: '',
    shipmentId: '',
    customer: '',
    warehouseName: 'Vioolsdrift Border Facility',
    commodity: '',
    weight: 12.0,
    entryDate: new Date().toISOString().split('T')[0],
    daysStored: 1,
    reason: 'Customs Paperwork Pending',
    status: 'Stored' as 'Stored' | 'Released' | 'Inspecting',
    dailyCost: 800,
    notes: ''
  });

  // Filter lists
  const warehouses = [
    'Vioolsdrift Border Facility',
    'Beit Bridge Depot & Storage',
    'Ramotswa Holding Yard',
    'JHB Main Depot Storage',
    'Oshoek Buffer Warehouse'
  ];

  const reasons = [
    'Customs Paperwork Pending',
    'Border Congestion / Wait Times',
    'Driver Mandatory Rest',
    'Border Closed overnight',
    'Hazardous Escort / Oversized Limit',
    'Routine Safety Inspection'
  ];

  const filteredConsignments = useMemo(() => {
    return warehouseConsignments.filter(item => {
      const matchesSearch = 
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        item.commodity.toLowerCase().includes(search.toLowerCase()) ||
        item.shipmentId.toLowerCase().includes(search.toLowerCase());

      const matchesWarehouse = selectedWarehouseFilter === 'All Warehouses' || item.warehouseName === selectedWarehouseFilter;
      const matchesStatus = selectedStatusFilter === 'All Status' || item.status === selectedStatusFilter;
      const matchesReason = selectedReasonFilter === 'All Reasons' || item.reason === selectedReasonFilter;

      return matchesSearch && matchesWarehouse && matchesStatus && matchesReason;
    });
  }, [warehouseConsignments, search, selectedWarehouseFilter, selectedStatusFilter, selectedReasonFilter]);

  // Overnight Stay stats calculations
  const stats = useMemo(() => {
    const active = warehouseConsignments.filter(c => c.status !== 'Released');
    const totalStoredCount = active.length;
    const inspectCount = active.filter(c => c.status === 'Inspecting').length;
    
    // Calculate total accumulated overnight cost for currently active items
    const activeCostsAccumulated = active.reduce((sum, item) => sum + (item.daysStored * item.dailyCost), 0);
    const activeDailyRate = active.reduce((sum, item) => sum + item.dailyCost, 0);

    const paperHoldCount = active.filter(c => c.reason === 'Customs Paperwork Pending' || c.reason.includes('Paperwork')).length;

    return {
      totalStoredCount,
      activeCostsAccumulated,
      activeDailyRate,
      paperHoldCount,
      inspectCount
    };
  }, [warehouseConsignments]);

  const handleOpenAdd = () => {
    const randomWH = `WH-${Math.floor(Math.random() * 900) + 100}`;
    const nextShipment = shipments.find(s => s.status !== 'Delivered') || shipments[0];
    
    setFormData({
      id: randomWH,
      shipmentId: nextShipment?.id || '',
      customer: nextShipment?.customer || '',
      warehouseName: 'Vioolsdrift Border Facility',
      commodity: nextShipment?.commodity || 'General Cargo',
      weight: nextShipment?.weight || 15.0,
      entryDate: new Date().toISOString().split('T')[0],
      daysStored: 1,
      reason: 'Driver Mandatory Rest',
      status: 'Stored',
      dailyCost: 850,
      notes: ''
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WarehouseConsignment) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      shipmentId: item.shipmentId,
      customer: item.customer,
      warehouseName: item.warehouseName,
      commodity: item.commodity,
      weight: item.weight,
      entryDate: item.entryDate,
      daysStored: item.daysStored,
      reason: item.reason,
      status: item.status,
      dailyCost: item.dailyCost,
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleShipmentSelectChange = (shipId: string) => {
    const match = shipments.find(s => s.id === shipId);
    if (match) {
      setFormData(prev => ({
        ...prev,
        shipmentId: shipId,
        customer: match.customer,
        commodity: match.commodity,
        weight: match.weight
      }));
    }
  };

  const handleQuickRelease = (id: string, customer: string) => {
    updateWarehouseConsignment(id, { status: 'Released' });
    addActivity(`Overnight Consignment Released`, `Checked out ${id} for ${customer} from storage`, 'gr');
  };

  const handleDelete = (id: string) => {
    if (confirm(`Remove overnight warehouse log for ${id}?`)) {
      deleteWarehouseConsignment(id);
      addActivity(`Warehouse Log Deleted`, `Overnight log ${id} removed`, 'rd');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shipmentId || !formData.customer || !formData.warehouseName) {
      alert('Required parameters missing. Please select/fill necessary elements.');
      return;
    }

    if (editingItem) {
      updateWarehouseConsignment(formData.id, formData);
      addActivity(`Overnight Stay Updated`, `Storage log ${formData.id} revised. Status: ${formData.status}`, 'ac');
    } else {
      addWarehouseConsignment(formData);
      addActivity(`New Storage Event Logged`, `${formData.id} checked into ${formData.warehouseName} overnight`, 'gr');
    }

    setIsModalOpen(false);
  };

  // Quick helper to determine visual coloring for stay reasons
  const getReasonColor = (reason: string) => {
    if (reason.includes('Paper') || reason.includes('Customs')) return 'text-[#ef4444] border-red-500/10 bg-red-950/25';
    if (reason.includes('Rest')) return 'text-[#3b82f6] border-blue-500/10 bg-blue-950/25';
    if (reason.includes('Closed')) return 'text-amber-400 border-amber-500/10 bg-amber-950/25';
    if (reason.includes('Escort') || reason.includes('Oversized')) return 'text-purple-400 border-purple-500/10 bg-purple-950/25';
    return 'text-[var(--color-text-dim)] border-[var(--color-border-2)] bg-[var(--color-surface-2)]';
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader 
        title="Overnight Warehousing" 
        subtitle="Operational ledger for cross-border consignments held or staying overnight in network hubs and secure border depots."
        actions={
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded font-bold text-[11px] uppercase tracking-wider bg-[var(--color-brand-accent)] text-black hover:opacity-90 flex items-center gap-2 cursor-pointer transition-all border border-transparent shadow-[0_4px_14px_rgba(240,165,0,0.15)]"
          >
            <Plus size={14} /> Log Storage Event
          </button>
        }
      />

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
        <Card className="flex flex-col p-5 bg-[var(--color-surface-1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-3">
            Currently Stored
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-white leading-none font-sans">
              {stats.totalStoredCount}
            </span>
            <span className="text-[10.5px] font-semibold text-zinc-400">consignments overnight</span>
          </div>
          <div className="text-[9.5px] text-[var(--color-text-muted)] mt-auto pt-3 border-t border-[var(--color-border-2)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse"></span>
            <span>Total current network occupancy</span>
          </div>
        </Card>

        <Card className="flex flex-col p-5 bg-[var(--color-surface-1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-3">
            Overnight Daily Costs
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[var(--color-brand-accent)] leading-none font-mono">
              {fmtR(stats.activeDailyRate)}
            </span>
            <span className="text-[10.5px] font-semibold text-zinc-400">/ night</span>
          </div>
          <div className="text-[9.5px] text-amber-300 mt-auto pt-3 border-t border-[var(--color-border-2)] flex items-center gap-1.5">
            <Clock size={12} />
            <span>Accumulated storage: {fmtR(stats.activeCostsAccumulated)} total</span>
          </div>
        </Card>

        <Card className="flex flex-col p-5 bg-[var(--color-surface-1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-3">
            Customs Paperwork Holds
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[var(--color-brand-red)] leading-none font-sans">
              {stats.paperHoldCount}
            </span>
            <span className="text-[10.5px] font-semibold text-zinc-400">shipments blocked</span>
          </div>
          <div className="text-[9.5px] text-red-300 mt-auto pt-3 border-t border-[var(--color-border-2)] flex items-center gap-1.5">
            <ShieldAlert size={12} className="shrink-0" />
            <span>Awaiting document clearance logs</span>
          </div>
        </Card>

        <Card className="flex flex-col p-5 bg-[var(--color-surface-1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110"></div>
          <div className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-[var(--color-text-muted)] mb-3">
            Occupancy Health
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[var(--color-brand-green)] leading-none font-sans">
              92.4%
            </span>
            <span className="text-[10.5px] font-semibold text-zinc-400">efficiency</span>
          </div>
          <div className="text-[9.5px] text-[var(--color-text-muted)] mt-auto pt-3 border-t border-[var(--color-border-2)] flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span>Target overnight SLA limit matched</span>
          </div>
        </Card>
      </div>

      {/* Main Filter Toolbar & Register List */}
      <div className="px-8">
        <Card className="p-0">
          {/* Filtering Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-[var(--color-border-1)] bg-[var(--color-surface-1)]">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 max-w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search Whscode, cargo, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-main)] placeholder-zinc-500 border border-[var(--color-border-2)] rounded font-sans focus:outline-none focus:border-[var(--color-brand-accent)]"
                />
              </div>

              {/* Warehouse Selection filter */}
              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-main)] border border-[var(--color-border-2)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-brand-accent)] font-sans"
              >
                <option value="All Warehouses">🗺️ All Network Warehouses</option>
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              {/* Reason selection filter */}
              <select
                value={selectedReasonFilter}
                onChange={(e) => setSelectedReasonFilter(e.target.value)}
                className="bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-main)] border border-[var(--color-border-2)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-brand-accent)] font-sans"
              >
                <option value="All Reasons">📋 All Overnight Reasons</option>
                {reasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Status selection filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-main)] border border-[var(--color-border-2)] rounded px-2.5 py-1.5 focus:outline-none focus:border-[var(--color-brand-accent)] font-sans"
              >
                <option value="All Status">⚡ All Statuses</option>
                <option value="Stored">🔴 Held Stored</option>
                <option value="Inspecting">🟡 Under Inspection</option>
                <option value="Released">🟢 Released / Proceeding</option>
              </select>
            </div>

            {/* Total count badge */}
            <div className="font-mono text-[10px] text-[var(--color-text-dim)] uppercase bg-[var(--color-surface-2)] px-2.5 py-1 rounded border border-[var(--color-border-2)]">
              Matches: <strong className="text-white">{filteredConsignments.length}</strong> Consignments
            </div>
          </div>

          {/* Ledger Table */}
          {filteredConsignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--color-text-muted)] py-16">
              <Building2 size={32} className="text-zinc-600 mb-3 animate-pulse" />
              <p className="font-semibold text-white text-[12px] uppercase tracking-wide">No holding logs match query</p>
              <p className="text-[10px] text-zinc-500 max-w-sm mt-1">Try resetting the search terms or filters to return all cross-border overnight storage manifests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <Tr>
                    <Th className="w-[110px]">AWB & WH CODE</Th>
                    <Th>Client & Commodity</Th>
                    <Th>Storage Location</Th>
                    <Th className="w-[120px]">Hold Duration</Th>
                    <Th className="w-[200px]">Overnight Reason</Th>
                    <Th className="w-[110px] text-right">Daily Cost (ZAR)</Th>
                    <Th className="w-[90px] text-center">Status</Th>
                    <Th className="w-[150px] text-right">Actions</Th>
                  </Tr>
                </thead>
                <tbody>
                  {filteredConsignments.map((item) => {
                    const totalCost = item.daysStored * item.dailyCost;
                    
                    return (
                      <Tr key={item.id} className="hover:bg-zinc-900/40 border-b border-[var(--color-border-2)] transition-colors">
                        <Td>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-extrabold text-[var(--color-brand-accent)] text-[11px] leading-tight select-all">
                              {item.id}
                            </span>
                            <span className="text-[9.5px] font-mono text-zinc-400">
                              {item.shipmentId}
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[11px] truncate max-w-[170px] leading-tight">{item.customer}</span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                              📦 {item.commodity} <span className="opacity-40">·</span> {item.weight}T
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                            <span className="font-medium text-white text-[10.5px] leading-tight flex flex-col">
                              {item.warehouseName}
                              <span className="text-[8.5px] font-mono font-bold uppercase text-[var(--color-text-dim)] tracking-tight">DEPOT SECURITY REGISTERED</span>
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex flex-col gap-0.5 font-mono">
                            <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                              ⏱️ {item.daysStored} {item.daysStored === 1 ? 'Night' : 'Nights'}
                            </span>
                            <span className="text-[9px] text-[var(--color-text-dim)]">
                              In since {fmtDate(item.entryDate)}
                            </span>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex flex-col gap-1 pr-2">
                            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold font-mono border rounded-[3px] w-fit leading-none ${getReasonColor(item.reason)}`}>
                              {item.reason}
                            </span>
                            {item.notes && (
                              <p className="text-[9.5px] text-zinc-400 italic max-w-[200px] leading-tight truncate" title={item.notes}>
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                        </Td>
                        <Td className="text-right">
                          <div className="flex flex-col font-mono text-right">
                            <span className="text-[11px] font-bold text-white pr-1">
                              {fmtR(totalCost)}
                            </span>
                            <span className="text-[9px] text-zinc-400 pr-1">
                              {fmtR(item.dailyCost)}/night
                            </span>
                          </div>
                        </Td>
                        <Td className="text-center">
                          <Badge status={item.status === 'Stored' ? 'Hold' : item.status === 'Released' ? 'Delivered' : 'In Transit'}>
                            {item.status}
                          </Badge>
                        </Td>
                        <Td className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {item.status !== 'Released' && (
                              <button
                                onClick={() => handleQuickRelease(item.id, item.customer)}
                                className="px-2 py-1 rounded text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer border border-emerald-500/20"
                                title="Approve release/clearance checkout"
                              >
                                Release
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-2 py-1 rounded text-[9.5px] font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer border border-zinc-700/50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-1.5 py-1 rounded text-[9.5px] font-semibold bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-black transition-all cursor-pointer border border-red-500/10"
                            >
                              ✕
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Entry Addition & Dialog Box Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg p-0 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] overflow-hidden shadow-[0_12px_44px_rgba(0,0,0,0.8)]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--color-border-1)] flex justify-between items-center bg-[#131722]">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[var(--color-brand-accent)]" />
                <h4 className="text-[13px] font-semibold text-white uppercase tracking-wider font-sans">
                  {editingItem ? 'Edit Overnight Log' : 'New Storage Event Record'}
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Custom Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-[11px] text-[var(--color-text-main)] font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Event Storage ID */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Warehouse Code (ID)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    required
                    disabled={!!editingItem}
                    placeholder="e.g. WH-183"
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-mono disabled:opacity-50"
                  />
                </div>

                {/* Dispatch Waybill select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Linked Shipment ID (AWB)</label>
                  <select
                    value={formData.shipmentId}
                    onChange={(e) => handleShipmentSelectChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-mono"
                  >
                    <option value="">-- Choose Active AWB --</option>
                    {shipments.map(s => (
                      <option key={s.id} value={s.id}>{s.id} ({s.destCity})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Client Company Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Client Account</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)]"
                  />
                </div>

                {/* Commodity details */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Commodity & Weight (Tons)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Retail etc"
                      value={formData.commodity}
                      onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)]"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      className="w-[80px] px-2 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Secure storage facility name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Secure Storage Facility Location</label>
                <select
                  value={formData.warehouseName}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)]"
                >
                  {warehouses.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Check In Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Check-in Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-mono"
                  />
                </div>

                {/* Days Stored */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Nights Stored</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.daysStored}
                    onChange={(e) => setFormData({ ...formData, daysStored: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-mono"
                  />
                </div>

                {/* Daily Cost */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Daily Rate (R)</label>
                  <input
                    type="number"
                    value={formData.dailyCost}
                    onChange={(e) => setFormData({ ...formData, dailyCost: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Holding Reason */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Overnight storage reason</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)]"
                  >
                    {reasons.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Current Holding Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)]"
                  >
                    <option value="Stored">🔴 Holds Stored</option>
                    <option value="Inspecting">🟡 Under Inspection</option>
                    <option value="Released">🟢 Released / Dispatched</option>
                  </select>
                </div>
              </div>

              {/* Extra Storage comments, customs docs issues */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Hazmat, paper logs, or specific storage details</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="For example: Driver resting hours logged; missing custom stamp; vehicle battery servicing; weather clearing wait etc..."
                  className="w-full h-18 px-3 py-2 bg-[var(--color-surface-2)] text-white border border-[var(--color-border-2)] rounded focus:outline-none focus:border-[var(--color-brand-accent)] font-sans resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--color-border-2)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--color-border-2)] text-zinc-300 rounded font-semibold hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-brand-accent)] text-black rounded font-extrabold uppercase tracking-widest text-[10px] hover:opacity-90 transition-all cursor-pointer shadow-[0_4px_12px_rgba(240,165,0,0.15)]"
                >
                  {editingItem ? 'Save Updates' : 'Add Register Log'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
