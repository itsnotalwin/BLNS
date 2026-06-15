import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, cn } from '@/lib/utils';
import { Search, Download, Plus, Edit, Trash2, X } from 'lucide-react';
import { Vehicle } from '@/types';

export default function Fleet() {
  const store = useStore();
  const fleet = store.fleet;

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    unit: '',
    make: '',
    model: '',
    type: 'Flatbed',
    reg: '',
    payload: 30,
    odometer: 100000,
    nextService: 115000,
    insurance: new Date().toISOString().split('T')[0],
    crossBorder: 'BW, LS, SZ',
    status: 'Running'
  });

  const truckTypes = ['Flatbed', 'Tanker', 'Refrigerated', 'Tri-axle Link', 'Superlink', 'Box Truck'];
  const truckStatuses = ['Running', 'Service Due', 'In Workshop', 'Breakdown', 'Idle'];

  const filtered = fleet.filter(f => {
    const matchesSearch = 
      f.unit.toLowerCase().includes(search.toLowerCase()) || 
      f.reg.toLowerCase().includes(search.toLowerCase()) ||
      f.make.toLowerCase().includes(search.toLowerCase()) ||
      f.model.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'All Types' || f.type === selectedType;
    const matchesStatus = selectedStatus === 'All Status' || f.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const run = fleet.filter(f => f.status === 'Running').length;
  const work = fleet.filter(f => f.status === 'Breakdown' || f.status === 'In Workshop').length;
  const idle = fleet.filter(f => f.status === 'Idle').length;

  const handleOpenAdd = () => {
    const nextNum = Math.floor(Math.random() * 90) + 10;
    setFormData({
      unit: `TA-0${nextNum}`,
      make: '',
      model: '',
      type: 'Flatbed',
      reg: `GP ${nextNum}-77 LL`,
      payload: 32,
      odometer: 120000,
      nextService: 135000,
      insurance: new Date(Date.now() + 86400000 * 250).toISOString().split('T')[0],
      crossBorder: 'BW, NA, ZW',
      status: 'Running'
    });
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      unit: v.unit,
      make: v.make,
      model: v.model,
      type: v.type,
      reg: v.reg,
      payload: v.payload,
      odometer: v.odometer,
      nextService: v.nextService,
      insurance: v.insurance,
      crossBorder: v.crossBorder,
      status: v.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (unit: string) => {
    if (confirm(`Are you sure you want to delete vehicle ${unit} from the active fleet list?`)) {
      store.deleteVehicle(unit);
      store.addActivity(`Vehicle Decommissioned`, `Truck unit ${unit} was removed from fleet roster`, 'rd');
    }
  };

  const handleAddSvc = (unit: string) => {
    store.updateVehicle(unit, { status: 'In Workshop' });
    store.addActivity(`Vehicle Sent for Service`, `Truck unit ${unit} status changed to 'In Workshop'`, 'ac');
    alert(`Vehicle ${unit} scheduled and updated to In Workshop status.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unit || !formData.make || !formData.model || !formData.reg) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingVehicle) {
      store.updateVehicle(formData.unit, formData);
      store.addActivity(`Vehicle Updated`, `Truck unit ${formData.unit} details revised`, 'ac');
    } else {
      store.addVehicle(formData);
      store.addActivity(`New Vehicle Added`, `Registered new unit ${formData.unit} (${formData.make} ${formData.model})`, 'gr');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    let csv = 'Unit,Make,Model,Type,Registration,Payload(T),Odometer,Next Service,Insurance,Cross Border,Status\n';
    filtered.forEach(f => {
      csv += `"${f.unit}","${f.make}","${f.model}","${f.type}","${f.reg}",${f.payload},${f.odometer},${f.nextService},"${f.insurance}","${f.crossBorder}","${f.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transafrica_fleet_${Date.now()}.csv`);
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Fleet Management" 
        subtitle="Vehicles, utilisation and maintenance status"
        actions={
          <div className="flex gap-2">
            <button 
              id="btn-export-fleet"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              id="btn-add-vehicle"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer"
            >
              <Plus size={14} /> Add Vehicle
            </button>
          </div>
        }
      />

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="TOTAL FLEET" value={fleet.length.toString()} colorClass="text-[var(--color-text-main)]" />
         <KPI title="RUNNING" value={run.toString()} colorClass="text-[var(--color-brand-green)]" barPercent={(run/Math.max(fleet.length,1))*100} />
         <KPI title="IN WORKSHOP" value={work.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="IDLE / AVAILABLE" value={idle.toString()} colorClass="text-[var(--color-brand-blue)]" />
      </div>

       <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search unit, reg, make, model..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>

        <select 
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-36 cursor-pointer"
        >
          <option value="All Types">All Types</option>
          {truckTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select 
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-36 cursor-pointer"
        >
          <option value="All Status">All Status</option>
          {truckStatuses.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>

       <div className="px-8">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Unit</Th>
                <Th>Make / Model</Th>
                <Th>Type</Th>
                <Th>Reg</Th>
                <Th>Payload(T)</Th>
                <Th>Odometer</Th>
                <Th>Next Service</Th>
                <Th>Insurance Exp</Th>
                <Th>Cross-Border</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const kmToSvc = f.nextService - f.odometer;
                const svcColor = kmToSvc < 2000 ? 'text-[var(--color-brand-red)] font-extrabold animate-pulse' : kmToSvc < 5000 ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-brand-green)]';
                return (
                  <Tr key={f.unit}>
                    <Td className="font-mono text-[var(--color-brand-accent)] font-semibold cursor-pointer" onClick={() => handleOpenEdit(f)}>{f.unit}</Td>
                    <Td className="font-semibold">{f.make} {f.model}</Td>
                    <Td>{f.type}</Td>
                    <Td className="font-mono text-[10px] whitespace-nowrap">{f.reg}</Td>
                    <Td className="font-mono">{f.payload}T</Td>
                    <Td className="font-mono">{f.odometer.toLocaleString()}km</Td>
                    <Td className={cn("font-mono font-semibold", svcColor)}>{kmToSvc.toLocaleString()}km</Td>
                    <Td className="font-mono text-[11px] whitespace-nowrap">{fmtShortDate(f.insurance)}</Td>
                    <Td className="text-[10.5px] font-semibold">{f.crossBorder || '—'}</Td>
                    <Td><Badge status={f.status}>{f.status}</Badge></Td>
                    <Td className="flex justify-end gap-1 flex-nowrap w-max ml-auto">
                      <button 
                        onClick={() => handleOpenEdit(f)}
                        className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] p-1.5 hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] cursor-pointer"
                        title="Edit Vehicle"
                      >
                        <Edit size={12} />
                      </button>
                      {f.status !== 'In Workshop' && (
                        <button 
                          onClick={() => handleAddSvc(f.unit)}
                          className="bg-[rgba(240,165,0,0.12)] border border-[rgba(240,165,0,0.2)] text-[var(--color-brand-accent)] rounded-[3px] px-2 py-0.5 text-[10.1px] hover:bg-orange-500/20 font-bold select-none cursor-pointer"
                        >
                          Service
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(f.unit)}
                        className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] p-1.5 hover:bg-red-500/20 cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={12} />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-[var(--color-text-dim)] font-mono text-[11px]">No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Fleet Form Modal */}
      {isModalOpen && (
        <div id="fleet-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-2)] w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in my-8">
            <div className="flex justify-between items-center bg-[var(--color-surface-2)] border-b border-[var(--color-border-1)] px-6 py-4">
              <h3 className="text-[13px] font-bold tracking-tight text-[var(--color-text-main)] uppercase">
                {editingVehicle ? `Edit Truck — ${formData.unit}` : 'Add Fleet Vehicle'}
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
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Unit Number</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingVehicle}
                    placeholder="e.g. TA-035"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] font-mono outline-none text-[var(--color-text-main)] disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Registration plate No</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. GP 12-34 TX"
                    value={formData.reg}
                    onChange={e => setFormData({ ...formData, reg: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] font-mono outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Make</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Scania, Volvo, Mercedes"
                    value={formData.make}
                    onChange={e => setFormData({ ...formData, make: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Model</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. G460, Actros"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Configuration Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {truckTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Payload capacity (Tons)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.payload}
                    onChange={e => setFormData({ ...formData, payload: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Current Odometer (km)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.odometer}
                    onChange={e => setFormData({ ...formData, odometer: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Next Major Service (km)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.nextService}
                    onChange={e => setFormData({ ...formData, nextService: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Insurance Policy Expiry</label>
                  <input 
                    type="date" 
                    required
                    value={formData.insurance}
                    onChange={e => setFormData({ ...formData, insurance: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Border Permits</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. BW, NA, SZ, ZW"
                    value={formData.crossBorder}
                    onChange={e => setFormData({ ...formData, crossBorder: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Operational Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {truckStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
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
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
