import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card, KPI } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtShortDate, fmtR } from '@/lib/utils';
import { Download, Plus, Trash2, Edit, X } from 'lucide-react';
import { WorkOrder } from '@/types';

export default function Maintenance() {
  const store = useStore();
  const workOrders = store.workOrders;
  const fleet = store.fleet;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    no: '',
    vehicle: '',
    type: 'Service',
    desc: '',
    workshop: '',
    opened: new Date().toISOString().split('T')[0],
    eta: new Date().toISOString().split('T')[0],
    cost: 1500,
    status: 'Scheduled',
    priority: 'Normal'
  });

  const woTypes = ['Service', 'Repair', 'Maintenance', 'Inspection', 'Tyre Replacement', 'Brake Calibration'];
  const woStatuses = ['Scheduled', 'In Progress', 'Completed', 'Awaiting Parts'];
  const woPriorities = ['Normal', 'High', 'Critical', 'Low'];

  const handleOpenAdd = () => {
    const nextNum = Math.floor(Math.random() * 900) + 100;
    setFormData({
      no: `WO-26${nextNum}`,
      vehicle: fleet[0]?.unit || '',
      type: 'Service',
      desc: '',
      workshop: 'JHB Main Depot',
      opened: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      cost: 4500,
      status: 'Scheduled',
      priority: 'Normal'
    });
    setEditingWO(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: WorkOrder) => {
    setEditingWO(w);
    setFormData({
      no: w.no,
      vehicle: w.vehicle,
      type: w.type,
      desc: w.desc,
      workshop: w.workshop,
      opened: w.opened,
      eta: w.eta,
      cost: w.cost,
      status: w.status,
      priority: w.priority
    });
    setIsModalOpen(true);
  };

  const handleDelete = (no: string) => {
    if (confirm(`Are you sure you want to delete work order ${no}?`)) {
      store.deleteWorkOrder(no);
      store.addActivity(`Work Order Deleted`, `Work order reference ${no} was deleted`, 'rd');
    }
  };

  const handleMarkComplete = (no: string) => {
    store.updateWorkOrder(no, { status: 'Completed', cost: 4200 }); // complete and assign typical cost if zero
    store.addActivity(`Work Order Completed`, `Work order ${no} was completed successfully`, 'gr');
    alert(`Work Order ${no} marked as Completed.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.no || !formData.desc || !formData.workshop) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingWO) {
      store.updateWorkOrder(formData.no, formData);
      store.addActivity(`Work Order Updated`, `Work order ${formData.no} revised`, 'ac');
    } else {
      store.addWorkOrder(formData);
      store.addActivity(`Work Order Created`, `Created ${formData.no} for ${formData.vehicle} (${formData.desc})`, 'gr');
    }

    setIsModalOpen(false);
  };

  const inWork = workOrders.filter(w => w.status === 'In Progress').length;
  const sched = workOrders.filter(w => w.status === 'Scheduled').length;
  const cost = workOrders.filter(w => w.status !== 'Completed').reduce((a, w) => a + w.cost, 0);
  const done = workOrders.filter(w => w.status === 'Completed').length;

  const exportCSV = () => {
    let csv = 'WO #,Vehicle,Type,Description,Workshop,Opened,ETA Done,Cost,Status,Priority\n';
    workOrders.forEach(w => {
      csv += `"${w.no}","${w.vehicle}","${w.type}","${w.desc}","${w.workshop}","${w.opened}","${w.eta}",${w.cost},"${w.status}","${w.priority}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transafrica_workorders_${Date.now()}.csv`);
    a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Maintenance & Repairs" 
        subtitle="Schedule services, track work orders, manage workshop"
        actions={
          <div className="flex gap-2">
            <button 
              id="btn-export-maintenance"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              id="btn-log-work-order"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer"
            >
              <Plus size={14} /> Log Work Order
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8">
         <KPI title="IN WORKSHOP" value={inWork.toString()} colorClass="text-[var(--color-brand-red)]" />
         <KPI title="SCHEDULED (7 DAYS)" value={sched.toString()} colorClass="text-[var(--color-brand-accent)]" />
         <KPI title="PENDING REPAIR VAL" value={fmtR(cost)} colorClass="text-[var(--color-brand-blue)]" />
         <KPI title="COMPLETED MTD" value={done.toString()} colorClass="text-[var(--color-brand-green)]" />
      </div>

      <div className="px-8 flex-1">
        <Card className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>WO #</Th>
                <Th>Vehicle</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th>Workshop</Th>
                <Th>Opened Date</Th>
                <Th>ETA Done</Th>
                <Th>Cost</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(w => (
                <Tr key={w.no}>
                  <Td className="font-mono text-[var(--color-brand-accent)] font-semibold cursor-pointer" onClick={() => handleOpenEdit(w)}>{w.no}</Td>
                  <Td className="font-mono text-[var(--color-brand-accent)]">{w.vehicle}</Td>
                  <Td className="text-[11px] font-semibold">{w.type}</Td>
                  <Td className="text-[11px] max-w-[200px] truncate" title={w.desc}>{w.desc}</Td>
                  <Td className="text-[11px] font-bold">{w.workshop}</Td>
                  <Td className="text-[11px] font-mono">{fmtShortDate(w.opened)}</Td>
                  <Td className="text-[11px] font-mono">{fmtShortDate(w.eta)}</Td>
                  <Td className="font-semibold font-mono text-[var(--color-brand-accent)]">{fmtR(w.cost)}</Td>
                  <Td>
                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                      w.priority === 'Critical' ? 'bg-red-500/20 text-red-500' :
                      w.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {w.priority}
                    </span>
                  </Td>
                  <Td><Badge status={w.status}>{w.status}</Badge></Td>
                  <Td className="flex justify-end gap-1 flex-nowrap w-max ml-auto">
                    <button 
                      onClick={() => handleOpenEdit(w)}
                      className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] p-1.5 hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] cursor-pointer"
                      title="Edit Work Order"
                    >
                      <Edit size={12} />
                    </button>
                    {w.status !== 'Completed' && (
                      <button 
                        onClick={() => handleMarkComplete(w.no)}
                        className="bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)] text-[var(--color-brand-green)] rounded-[3px] px-2 py-0.5 text-[10.5px] hover:bg-green-500/20 font-bold select-none cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(w.no)}
                      className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] p-1.5 hover:bg-red-500/20 cursor-pointer"
                      title="Delete Work Order"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Td>
                </Tr>
              ))}
              {workOrders.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-[var(--color-text-dim)] font-mono text-[11px]">No active work orders found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Work Order Form Modal */}
      {isModalOpen && (
        <div id="wo-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-2)] w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in my-8">
            <div className="flex justify-between items-center bg-[var(--color-surface-2)] border-b border-[var(--color-border-1)] px-6 py-4">
              <h3 className="text-[13px] font-bold tracking-tight text-[var(--color-text-main)] uppercase">
                {editingWO ? `Edit Work Order — ${formData.no}` : 'Log New Work Order'}
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
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Work Order Number</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingWO}
                    value={formData.no}
                    onChange={e => setFormData({ ...formData, no: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] font-mono outline-none text-[var(--color-text-main)] disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Assign Vehicle</label>
                  <select 
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {fleet.map(v => <option key={v.unit} value={v.unit}>{v.unit} — {v.make} {v.model}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Maintenance Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {woTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Workshop / Center Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. JHB Main Depot, Beit Bridge Repair"
                    value={formData.workshop}
                    onChange={e => setFormData({ ...formData, workshop: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[var(--color-text-muted)] font-semibold uppercase">Issue / Service Description</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Describe the vehicle issue or service requirements..."
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Opened Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.opened}
                    onChange={e => setFormData({ ...formData, opened: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">ETA Completed Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.eta}
                    onChange={e => setFormData({ ...formData, eta: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Estimated Cost (ZAR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Priority Level</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {woPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Current Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {woStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
                  {editingWO ? 'Save Changes' : 'Log Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
