import React, { useState } from 'react';
import { useStore } from '@/store';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Th, Td, Tr } from '@/components/ui/Table';
import { fmtR } from '@/lib/utils';
import { Search, Download, Plus, Edit, Trash2, X } from 'lucide-react';
import { Customer } from '@/types';

export default function Customers() {
  const store = useStore();
  const customers = store.customers;
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    name: '',
    country: '🇿🇦 🇧🇼 🇿🇼',
    email: '',
    ships: 0,
    revenue: 0,
    outstanding: 0,
    credit: 250000,
    tier: 'Gold',
    status: 'Active'
  });

  const tiers = ['Platinum', 'Gold', 'Silver', 'Regular'];
  const statuses = ['Active', 'Suspended', 'Inactive'];

  const filtered = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'All Status' || c.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      country: '🇿🇦 🇧🇼 🇿🇼',
      email: '',
      ships: 0,
      revenue: 0,
      outstanding: 0,
      credit: 500000,
      tier: 'Gold',
      status: 'Active'
    });
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      country: c.country,
      email: c.email,
      ships: c.ships,
      revenue: c.revenue,
      outstanding: c.outstanding,
      credit: c.credit,
      tier: c.tier,
      status: c.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete customer account ${name}?`)) {
      store.deleteCustomer(name);
      store.addActivity(`Customer Account Removed`, `Account ${name} was deleted from registry`, 'rd');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please fill in representing name and email.');
      return;
    }

    if (editingCustomer) {
      store.updateCustomer(formData.name, formData);
      store.addActivity(`Customer Updated`, `Revised profile for ${formData.name}`, 'ac');
    } else {
      store.addCustomer(formData);
      store.addActivity(`Customer Registered`, `Registered brand new CRM profile: ${formData.name} (${formData.tier})`, 'gr');
    }

    setIsModalOpen(false);
  };

  const exportCSV = () => {
    let csv = 'Customer Name,Countries,Email Contact,Trips MTD,Revenue MTD,Outstanding Amount,Credit Limit,Tier,Status\n';
    filtered.forEach(c => {
      csv += `"${c.name}","${c.country}","${c.email}",${c.ships},${c.revenue},${c.outstanding},${c.credit},"${c.tier}","${c.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transafrica_crm_${Date.now()}.csv`);
    a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Customer Management (CRM)" 
        subtitle="Accounts, contacts, freight history and credit limits"
        actions={
          <div className="flex gap-2">
            <button 
              id="btn-export-customers"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[12px] font-semibold hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] select-none cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              id="btn-add-customer"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[var(--color-brand-accent)] text-black border border-transparent font-bold text-[12px] hover:brightness-110 select-none cursor-pointer"
            >
              <Plus size={14} /> Add Customer
            </button>
          </div>
        }
      />

       <div className="px-8">
        <Card className="p-0 flex flex-col">
          <div className="p-3.5 border-b border-[var(--color-border-1)] flex justify-between items-center bg-[var(--color-surface-base)]">
            <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2 py-1.5 min-w-[200px]">
              <Search size={12} className="text-[var(--color-text-dim)]" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customer by name, email..." 
                className="bg-transparent border-none outline-none text-[var(--color-text-main)] text-[11px] font-sans w-full placeholder-[var(--color-text-dim)]"
              />
            </div>
            
            <select 
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-[var(--color-surface-1)] border border-[var(--color-border-1)] rounded-[5px] px-2.5 py-1.5 text-[11px] outline-none text-[var(--color-text-main)] w-32 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Customer</Th>
                <Th>Country Coverage</Th>
                <Th>Contact Email</Th>
                <Th>Ships(MTD)</Th>
                <Th>Revenue(MTD)</Th>
                <Th>Outstanding</Th>
                <Th>Credit Limit</Th>
                <Th>Tier</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <Tr key={c.name}>
                  <Td className="font-semibold cursor-pointer text-[var(--color-brand-accent)]" onClick={() => handleOpenEdit(c)}>{c.name}</Td>
                  <Td className="text-[11px]">{c.country}</Td>
                  <Td className="text-[11px] font-mono">{c.email}</Td>
                  <Td className="font-mono">{c.ships}</Td>
                  <Td className="font-semibold font-mono">{fmtR(c.revenue)}</Td>
                  <Td className={`font-semibold font-mono ${c.outstanding > 0 ? 'text-[var(--color-brand-accent)]' : 'text-[var(--color-brand-green)]'}`}>{c.outstanding > 0 ? fmtR(c.outstanding) : '—'}</Td>
                  <Td className="font-mono text-[11px] font-semibold">{fmtR(c.credit)}</Td>
                  <Td><Badge>{c.tier}</Badge></Td>
                  <Td><Badge status={c.status}>{c.status}</Badge></Td>
                  <Td className="flex justify-end gap-1 flex-nowrap w-max ml-auto">
                    <button 
                      onClick={() => handleOpenEdit(c)}
                      className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-[3px] p-1.5 hover:bg-[var(--color-border-1)] text-[var(--color-text-main)] cursor-pointer"
                      title="Edit Customer Details"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c.name)}
                      className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] text-[var(--color-brand-red)] rounded-[3px] p-1.5 hover:bg-red-500/20 cursor-pointer"
                      title="Delete Customer Account"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-[var(--color-text-dim)] font-mono text-[11px]">No customer matches found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Customer Form Modal */}
      {isModalOpen && (
        <div id="customer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border-2)] w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-fade-in my-8">
            <div className="flex justify-between items-center bg-[var(--color-surface-2)] border-b border-[var(--color-border-1)] px-6 py-4">
              <h3 className="text-[13px] font-bold tracking-tight text-[var(--color-text-main)] uppercase">
                {editingCustomer ? `Edit Customer — ${formData.name}` : 'Register New Customer Account'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-[11px]">
              <div className="flex flex-col gap-1.5">
                <label className="text-[var(--color-text-muted)] font-semibold uppercase">Customer Company Name</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingCustomer}
                  placeholder="e.g. Massmart Ltd"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Contact Email address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. logistics@client.co.za"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Corridor Flag Coverage</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 🇿🇦 🇧🇼 🇿🇼"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Trips / Shipments (MTD)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.ships}
                    onChange={e => setFormData({ ...formData, ships: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Revenue Generated (ZAR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.revenue}
                    onChange={e => setFormData({ ...formData, revenue: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Outstanding Balance (ZAR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.outstanding}
                    onChange={e => setFormData({ ...formData, outstanding: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Approved Credit limit (ZAR)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.credit}
                    onChange={e => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">SLA Tier Category</label>
                  <select 
                    value={formData.tier}
                    onChange={e => setFormData({ ...formData, tier: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[var(--color-text-muted)] font-semibold uppercase">Account Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="bg-[var(--color-surface-base)] border border-[var(--color-border-1)] rounded-[5px] px-3 py-2 text-[11px] outline-none text-[var(--color-text-main)] cursor-pointer"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
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
                  {editingCustomer ? 'Save Profile' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
