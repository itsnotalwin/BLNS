import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, daysLeft } from '@/lib/utils';
import { Search, Download, Plus, Edit, Trash2, X } from 'lucide-react';
import { Driver } from '@/types';

export default function Drivers() {
  const store = useStore();
  const drivers = store.drivers;
  const fleet = store.fleet;

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    licence: 'EC',
    prdp: 'Valid',
    prdpExp: new Date().toISOString().split('T')[0],
    countries: 'SA, BW',
    hours: 0,
    trips: 0,
    vehicle: '',
    phone: '',
    rating: 5.0,
    status: 'Off Duty'
  });

  const statuses = ['Active', 'On Route', 'At Border', 'At Depot', 'Off Duty'];
  const licences = ['EC', 'C1', 'EC1', 'Code 14', 'Code 10'];
  const prdpStatuses = ['Valid', 'Renewing', 'Expired'];

  const filtered = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.empId.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'All Status' || d.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const onRoute = drivers.filter(d => d.status === 'On Route').length;
  const prdpWarn = drivers.filter(d => daysLeft(d.prdpExp) < 60).length;
  const totalTrips = drivers.reduce((a, d) => a + d.trips, 0);

  const handleOpenAdd = () => {
    const nextId = Math.floor(Math.random() * 900) + 100;
    setFormData({
      name: '',
      empId: `EMP-0${nextId}`,
      licence: 'EC',
      prdp: 'Valid',
      prdpExp: new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
      countries: 'SA, BW, ZW',
      hours: 0,
      trips: 0,
      vehicle: fleet[0]?.unit || '',
      phone: '+27 ',
      rating: 5.0,
      status: 'At Depot'
    });
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      empId: driver.empId,
      licence: driver.licence,
      prdp: driver.prdp,
      prdpExp: driver.prdpExp,
      countries: driver.countries,
      hours: driver.hours,
      trips: driver.trips,
      vehicle: driver.vehicle,
      phone: driver.phone,
      rating: driver.rating,
      status: driver.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (empId: string, name: string) => {
    if (confirm(`Are you sure you want to delete driver ${name} (${empId})?`)) {
      store.deleteDriver(empId);
      store.addActivity(`Driver Terminated/Removed`, `Driver ${name} was deleted from active registry`, 'rd');
    }
  };

  const handleSendSMS = (driverName: string) => {
    alert(`SMS broadcast sent successfully to ${driverName} with current trip status and safety reminders.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.empId || !formData.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingDriver) {
      store.updateDriver(formData.empId, formData);
      store.addActivity(`Driver Details Updated`, `Information for ${formData.name} was successfully modified`, 'ac');
    } else {
      store.addDriver(formData);
      store.addActivity(`New Driver Onboarded`, `${formData.name} (${formData.empId}) successfully registered`, 'gr');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    let csv = 'Name,Employee ID,Licence,PrDP Status,PrDP Expiry,Countries,Hours MTD,Trips MTD,Vehicle,Phone,Rating,Status\n';
    filtered.forEach(d => {
      csv += `"${d.name}","${d.empId}","${d.licence}","${d.prdp}","${d.prdpExp}","${d.countries}",${d.hours},${d.trips},"${d.vehicle}","${d.phone}",${d.rating},"${d.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transafrica_drivers_${Date.now()}.csv`);
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Driver Management" 
        subtitle="PrDP tracking, hours, compliance and performance"
        actions={
          <div className="flex gap-2">
            <button 
              id="btn-export-drivers"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              id="btn-add-driver"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer"
            >
              <Plus size={14} /> Add Driver
            </button>
          </div>
        }
      />

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="TOTAL DRIVERS" value={drivers.length.toString()} colorClass="text-[var(--color-text-main)]" />
         <KPI title="ON ROUTE" value={onRoute.toString()} colorClass="text-[var(--color-brand-green)]" />
         <KPI title="PRDP EXPIRING" value={prdpWarn.toString()} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="TRIPS (MTD)" value={totalTrips.toString()} colorClass="text-[var(--color-brand-blue)]" />
      </div>

       <div className="flex flex-wrap items-center gap-2 px-8">
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 flex-1 min-w-[200px] max-w-[280px]">
          <Search size={12} className="text-[var(--color-text-dim)]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, ID, phone..." 
            className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
          />
        </div>
        
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
                <Th>Driver</Th>
                <Th>Emp ID</Th>
                <Th>Licence</Th>
                <Th>PrDP Status</Th>
                <Th>PrDP Expiry</Th>
                <Th>Countries</Th>
                <Th>Hrs (MTD)</Th>
                <Th>Trips (MTD)</Th>
                <Th>Vehicle</Th>
                <Th>Rating</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const dl = daysLeft(d.prdpExp);
                const isWarn = d.prdp === 'Renewing' || dl < 60;
                return (
                  <Tr key={d.empId}>
                    <Td className="font-semibold cursor-pointer text-[var(--color-brand-accent)]" onClick={() => handleOpenEdit(d)}>{d.name}</Td>
                    <Td className="font-mono text-[11px]">{d.empId}</Td>
                    <Td className="font-mono text-[11px]">{d.licence}</Td>
                    <Td><Badge status={isWarn ? 'Expiring' : 'Valid'}>{isWarn ? (d.prdp === 'Renewing' ? 'Renewing' : 'Expiring') : 'Valid'}</Badge></Td>
                    <Td className="text-[11px] font-mono">{fmtShortDate(d.prdpExp)}</Td>
                    <Td className="text-[10px] font-semibold">{d.countries}</Td>
                    <Td className="font-mono">{d.hours}h</Td>
                    <Td className="font-mono">{d.trips}</Td>
                    <Td className="font-mono text-[10px] text-[var(--color-brand-accent)]">{d.vehicle || '—'}</Td>
                    <Td className="text-[11px] font-semibold">{d.rating.toFixed(1)} ⭐</Td>
                    <Td><Badge status={d.status}>{d.status}</Badge></Td>
                    <Td className="flex justify-end gap-1 flex-nowrap w-max ml-auto">
                      <button 
                        onClick={() => handleOpenEdit(d)}
                        className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] p-1.5 hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] cursor-pointer"
                        title="Edit Driver"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => handleSendSMS(d.name)}
                        className="bg-[rgba(240,165,0,0.12)] border border-[rgba(240,165,0,0.2)] text-[var(--color-brand-accent)] rounded-[3px] px-2 py-0.5 text-[10px] hover:bg-orange-500/20 font-bold select-none cursor-pointer"
                      >
                        SMS
                      </button>
                      <button 
                        onClick={() => handleDelete(d.empId, d.name)}
                        className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] p-1.5 hover:bg-red-500/20 cursor-pointer"
                        title="Delete Driver"
                      >
                        <Trash2 size={12} />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-[var(--color-text-dim)] font-mono text-[11px]">No drivers found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Driver Form Modal */}
      {isModalOpen && (
        <div id="driver-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-2)] w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in my-8">
            <div className="flex justify-between items-center bg-[var(--color-surface-2)] border-b border-[var(--color-border-1)] px-6 py-4">
              <h3 className="text-[13px] font-bold tracking-tight text-[var(--color-text-main)] uppercase">
                {editingDriver ? `Edit Driver — ${formData.empId}` : 'Register New Driver'}
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
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Driver Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Sipho Nkosi"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Employee ID Card</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingDriver}
                    value={formData.empId}
                    onChange={e => setFormData({ ...formData, empId: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] font-mono outline-none text-[var(--color-text-main)] disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Mobile Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+27 82 000 0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Licence Code</label>
                  <select 
                    value={formData.licence}
                    onChange={e => setFormData({ ...formData, licence: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {licences.map(lc => <option key={lc} value={lc}>{lc}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">PrDP Status</label>
                  <select 
                    value={formData.prdp}
                    onChange={e => setFormData({ ...formData, prdp: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text(--[color-text-main)] cursor-pointer"
                  >
                    {prdpStatuses.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">PrDP Expiry Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.prdpExp}
                    onChange={e => setFormData({ ...formData, prdpExp: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Country Permits</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. SA, BW, ZW"
                    value={formData.countries}
                    onChange={e => setFormData({ ...formData, countries: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Assigned Truck</label>
                  <select 
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    <option value="">None</option>
                    {fleet.map(v => <option key={v.unit} value={v.unit}>{v.unit} — {v.make}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Hours MTD</label>
                  <input 
                    type="number"
                    value={formData.hours}
                    onChange={e => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Trips MTD</label>
                  <input 
                    type="number"
                    value={formData.trips}
                    onChange={e => setFormData({ ...formData, trips: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Overall Rating</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Duty Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {statuses.map(st => <option key={st} value={st}>{st}</option>)}
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
                  {editingDriver ? 'Save Changes' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
