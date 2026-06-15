import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, flagFor } from '@/lib/utils';
import { Search, Download, Plus, Edit, Trash2, X } from 'lucide-react';
import { Shipment } from '@/types';

export default function Shipments() {
  const store = useStore();
  const shipments = store.shipments;
  const fleet = store.fleet;
  const drivers = store.drivers;

  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    id: '',
    customer: '',
    origin: 'Johannesburg',
    destCity: '',
    country: 'Botswana',
    commodity: '',
    weight: 15,
    vehicle: '',
    driver: '',
    border: '',
    status: 'Pending',
    eta: new Date().toISOString().split('T')[0],
    rate: 800,
    notes: ''
  });

  const countries = ['Botswana', 'Namibia', 'Eswatini', 'Lesotho', 'Zimbabwe', 'South Africa'];
  const statuses = ['Pending', 'Loading', 'In Transit', 'Customs Hold', 'Delayed', 'Delivered'];

  const filtered = shipments.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(search.toLowerCase()) || 
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.commodity.toLowerCase().includes(search.toLowerCase()) ||
      (s.driver && s.driver.toLowerCase().includes(search.toLowerCase()));

    const matchesCountry = selectedCountry === 'All Countries' || s.country === selectedCountry;
    const matchesStatus = selectedStatus === 'All Status' || s.status === selectedStatus;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  const handleOpenAdd = () => {
    const nextIdNumber = Math.floor(Math.random() * 900) + 100;
    setFormData({
      id: `TAF-2406-${nextIdNumber}`,
      customer: '',
      origin: 'Johannesburg',
      destCity: '',
      country: 'Botswana',
      commodity: '',
      weight: 18.5,
      vehicle: fleet[0]?.unit || '',
      driver: drivers[0]?.name || '',
      border: 'Tlokweng Gate',
      status: 'Pending',
      eta: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      rate: 950,
      notes: ''
    });
    setEditingShipment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setFormData({
      id: shipment.id,
      customer: shipment.customer,
      origin: shipment.origin,
      destCity: shipment.destCity,
      country: shipment.country,
      commodity: shipment.commodity,
      weight: shipment.weight,
      vehicle: shipment.vehicle,
      driver: shipment.driver,
      border: shipment.border,
      status: shipment.status,
      eta: shipment.eta,
      rate: shipment.rate,
      notes: shipment.notes
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete shipment ${id}?`)) {
      store.deleteShipment(id);
      store.addActivity(`Shipment Deleted`, `Shipment ${id} was removed from active manifest`, 'rd');
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    store.updateShipment(id, { status: newStatus });
    store.addActivity(`Status Updated`, `Shipment ${id} status set to ${newStatus}`, 'ac');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer || !formData.destCity || !formData.commodity) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingShipment) {
      // Edit
      store.updateShipment(formData.id, formData);
      store.addActivity(`Shipment Updated`, `Shipment ${formData.id} details modified`, 'ac');
    } else {
      // Add
      store.addShipment(formData);
      store.addActivity(`New Shipment Created`, `Created ${formData.id} to ${formData.destCity} (${formData.country})`, 'gr');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    let csv = 'AWB,Customer,Origin,Destination,Country,Commodity,Weight(T),Vehicle,Driver,Border,Status,ETA,Rate\n';
    filtered.forEach(s => {
      csv += `"${s.id}","${s.customer}","${s.origin}","${s.destCity}","${s.country}","${s.commodity}",${s.weight},"${s.vehicle}","${s.driver}","${s.border}","${s.status}","${s.eta}",${s.rate}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transafrica_shipments_${Date.now()}.csv`);
    a.click();
  };

  const uniqueCountries = Array.from(new Set(shipments.map(s => s.country)));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Shipments" 
        subtitle="Full freight movement management across BLNS"
        actions={
          <div className="flex gap-2">
            <button 
              id="btn-export-shipments"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] select-none cursor-pointer text-[var(--color-text-main)]"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              id="btn-new-shipment"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer"
            >
              <Plus size={14} /> New Shipment
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search AWB, customer, driver, cargo..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>
        
        <select 
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-36 cursor-pointer"
        >
          <option value="All Countries">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-36 cursor-pointer"
        >
          <option value="All Status">All Status</option>
          {statuses.map(st => <option key={st} value={st}>{st}</option>)}
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
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <Tr key={s.id}>
                  <Td className="font-mono text-[var(--color-brand-accent)] font-semibold cursor-pointer" onClick={() => handleOpenEdit(s)}>{s.id}</Td>
                  <Td className="font-semibold">{s.customer}</Td>
                  <Td>🇿🇦 {s.origin}</Td>
                  <Td>{flagFor(s.country)} {s.destCity}</Td>
                  <Td>{s.commodity}</Td>
                  <Td className="font-mono text-[11px]">{s.weight}T</Td>
                  <Td className="font-mono text-[10px] text-[var(--color-brand-accent)]">{s.vehicle || '—'}</Td>
                  <Td>{s.driver || 'Unassigned'}</Td>
                  <Td className="text-[10.5px] font-mono">{s.border || '—'}</Td>
                  <Td>
                    <select
                      value={s.status}
                      onChange={e => handleQuickStatusChange(s.id, e.target.value)}
                      className="bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)] border border-[var(--color-border-1)] rounded-[3px] text-[10.5px] py-0.5 px-1 outline-none text-[var(--color-text-main)] font-medium cursor-pointer"
                    >
                      {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </Td>
                  <Td className="font-mono text-[10px] whitespace-nowrap">{fmtShortDate(s.eta)}</Td>
                  <Td className="flex justify-end gap-1 flex-nowrap shrink-0 w-max ml-auto">
                    <button 
                      onClick={() => handleOpenEdit(s)}
                      className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] p-1 hover:bg-[var(--color-border-1)] font-semibold text-[var(--color-text-main)] cursor-pointer"
                      title="Edit Shipment"
                    >
                      <Edit size={12} />
                    </button>
                    {s.status === 'Pending' && (
                      <button 
                        onClick={() => handleQuickStatusChange(s.id, 'In Transit')}
                        className="bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.2)] text-[var(--color-brand-green)] rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold select-none cursor-pointer hover:bg-emerald-500/20"
                      >
                        Dispatch
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] scroll-py-1 text-[var(--color-brand-red)] rounded-[3px] p-1 hover:bg-red-500/20 cursor-pointer"
                      title="Delete Shipment"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-[var(--color-text-dim)] text-[11px] font-mono">No shipments found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>
      
      <div className="px-8 text-[11px] text-[var(--color-text-muted)]">
        Showing {filtered.length} of {shipments.length} shipments
      </div>

      {/* Elegant overlay Modal for Add/Edit */}
      {isModalOpen && (
        <div id="shipment-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-2)] w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in my-8">
            <div className="flex justify-between items-center bg-[var(--color-surface-2)] border-b border-[var(--color-border-1)] px-6 py-4">
              <h3 className="text-[13px] font-bold tracking-tight text-[var(--color-text-main)] uppercase">
                {editingShipment ? `Edit Shipment — ${formData.id}` : 'Create New Shipment'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-[11px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">AWB Manifest ID (Required)</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingShipment}
                    value={formData.id}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] font-mono outline-none text-[var(--color-text-main)] disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Customer (Required)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Shoprite Holdings"
                    value={formData.customer}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Origin Country & City</label>
                  <input 
                    type="text" 
                    required
                    value={formData.origin}
                    onChange={e => setFormData({ ...formData, origin: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Commodity / Cargo Type</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Retail Goods, Chemicals"
                    value={formData.commodity}
                    onChange={e => setFormData({ ...formData, commodity: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Destination City</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Gaborone"
                    value={formData.destCity}
                    onChange={e => setFormData({ ...formData, destCity: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Dest Country</label>
                  <select 
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Weight (Tons)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Assign Vehicle</label>
                  <select 
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {fleet.map(v => <option key={v.unit} value={v.unit}>{v.unit} — {v.make} ({v.type})</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Assign Driver</label>
                  <select 
                    value={formData.driver}
                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map(d => <option key={d.empId} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Border Post</label>
                  <input 
                    type="text"
                    required
                    value={formData.border}
                    onChange={e => setFormData({ ...formData, border: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Initial Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">ETA Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.eta}
                    onChange={e => setFormData({ ...formData, eta: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Freight Rate (USD/T)</label>
                  <input 
                    type="number"
                    required
                    value={formData.rate}
                    onChange={e => setFormData({ ...formData, rate: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[var(--color-text-muted)] font-semibold uppercase">Internal Dispatch Notes</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Hazardous class certificates checked..."
                  className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--color-border-1)]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-[5px] bg-[var(--color-brand-accent)] text-black font-bold hover:brightness-110 text-[11px] cursor-pointer"
                >
                  {editingShipment ? 'Save Changes' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
