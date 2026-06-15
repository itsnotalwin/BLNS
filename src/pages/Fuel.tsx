import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, fmtR } from '@/lib/utils';
import { Download, Plus, Trash2, X } from 'lucide-react';

export default function Fuel() {
  const store = useStore();
  const fuel = store.fuel;
  const fleet = store.fleet;
  const drivers = store.drivers;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Field States
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicle: '',
    driver: '',
    location: '',
    country: '🇿🇦 SA',
    litres: 100,
    rate: 24.80
  });

  const countries = [
    { name: 'South Africa', code: '🇿🇦 SA' },
    { name: 'Botswana', code: '🇧🇼 BW' },
    { name: 'Namibia', code: '🇳🇦 NA' },
    { name: 'Eswatini', code: '🇸🇿 SZ' },
    { name: 'Lesotho', code: '🇱🇸 LS' },
    { name: 'Zimbabwe', code: '🇿🇼 ZW' }
  ];

  const handleOpenAdd = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      vehicle: fleet[0]?.unit || '',
      driver: drivers[0]?.name || '',
      location: 'Johannesburg (Depot)',
      country: '🇿🇦 SA',
      litres: 450,
      rate: 24.85
    });
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this fuel log entry?')) {
      store.deleteFuel(index);
      store.addActivity(`Fuel Log Removed`, `A refuel event was deleted from logs`, 'rd');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location || !formData.litres || !formData.rate) {
      alert('Please fill in all fields.');
      return;
    }

    const total = parseFloat((formData.litres * formData.rate).toFixed(2));
    const newEntry = {
      ...formData,
      total
    };

    store.addFuel(newEntry);
    store.addActivity(
      `Fuel Logged`, 
      `Logged ${formData.litres}L (R${total}) for ${formData.vehicle} by ${formData.driver}`, 
      'pu'
    );
    setIsModalOpen(false);
  };

  const totalL = fuel.reduce((a, f) => a + f.litres, 0);
  const totalCost = fuel.reduce((a, f) => a + f.total, 0);
  const avgL = fuel.length ? (totalL / fuel.length).toFixed(1) : "0";

  const exportCSV = () => {
    let csv = 'Date,Vehicle,Driver,Location,Country,Litres,Rate,Total\n';
    fuel.forEach(f => {
      csv += `"${f.date}","${f.vehicle}","${f.driver}","${f.location}","${f.country}",${f.litres},${f.rate},${f.total}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transafrica_fuel_${Date.now()}.csv`);
    a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Fuel Management" 
        subtitle="Consumption tracking, bunker cards and cost control"
        actions={
          <div className="flex gap-2">
            <button 
              id="btn-export-fuel"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              id="btn-log-refuel"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer"
            >
              <Plus size={14} /> Log Refuel
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="MTD LITRES" value={`${totalL.toLocaleString()}L`} colorClass="text-[var(--color-text-main)]" />
         <KPI title="AVG CONSUMPTION" value={`${avgL} L/km`} colorClass="text-[var(--color-brand-blue)]" />
         <KPI title="FUEL COST (MTD)" value={fmtR(totalCost)} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="DIESEL RATE (AVG)" value="R24.80/L" colorClass="text-[var(--color-brand-accent)]" />
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
                <Th>Total Cost</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {fuel.map((f, idx) => (
                <Tr key={idx}>
                  <Td className="text-[11px] font-mono">{fmtShortDate(f.date)}</Td>
                  <Td className="font-mono text-[10.5px] text-[var(--color-brand-accent)] font-semibold">{f.vehicle}</Td>
                  <Td className="font-semibold">{f.driver}</Td>
                  <Td className="text-[11px] font-semibold">{f.location}</Td>
                  <Td className="font-mono text-[11px] font-bold">{f.country}</Td>
                  <Td className="font-semibold font-mono">{f.litres.toLocaleString()}L</Td>
                  <Td className="font-mono text-[11px]">R{f.rate.toFixed(2)}</Td>
                  <Td className="font-semibold text-[var(--color-brand-accent)] font-mono">{fmtR(f.total)}</Td>
                  <Td className="text-right">
                    <button 
                      onClick={() => handleDelete(idx)}
                      className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] p-1 h-7 w-7 inline-flex items-center justify-center hover:bg-red-500/20 cursor-pointer"
                      title="Delete Refuel Entry"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Td>
                </Tr>
              ))}
              {fuel.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[var(--color-text-dim)] font-mono text-[11px]">No fuel logs found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Fuel Log Modal */}
      {isModalOpen && (
        <div id="fuel-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-2)] w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-fade-in my-8">
            <div className="flex justify-between items-center bg-[var(--color-surface-2)] border-b border-[var(--color-border-1)] px-6 py-4">
              <h3 className="text-[13px] font-bold tracking-tight text-[var(--color-text-main)] uppercase">
                Log New Refueling Event
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
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Refuel Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Country Station</label>
                  <select 
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {countries.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code.split(' ')[1]})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Select Vehicle</label>
                  <select 
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {fleet.map(v => <option key={v.unit} value={v.unit}>{v.unit} — {v.make}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Select Driver</label>
                  <select 
                    value={formData.driver}
                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {drivers.map(d => <option key={d.empId} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[var(--color-text-muted)] font-semibold uppercase">Station Location Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mbabane Shell, Windhoek BP"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Litres Filled</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.litres}
                    onChange={e => setFormData({ ...formData, litres: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text(--[color-text-muted)] font-semibold uppercase">Fuel Rate per Litre (ZAR)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="0.1"
                    value={formData.rate}
                    onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
              </div>

              {/* Live cost forecast */}
              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border-1)] rounded-lg p-3 text-center mt-2">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Calculated Cost Total</div>
                <div className="text-[16px] font-bold text-[var(--color-brand-accent)] font-mono">
                  {fmtR(formData.litres * formData.rate)}
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
                  Save Log entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
