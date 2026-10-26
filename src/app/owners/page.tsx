'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  Plus,
  ArrowRight,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  DollarSign,
  Box,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { PropertyOwner } from '@/types/database';
import { formatCurrency, formatNumber } from '@/lib/formatters';

export default function OwnersPage() {
  const { canViewFinancials } = useAuth();

  // State
  const [ownersList, setOwnersList] = useState<PropertyOwner[]>(() => db.getOwners());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<PropertyOwner | null>(null);
  const [selectedOwnerDetail, setSelectedOwnerDetail] = useState<PropertyOwner | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'archived',
    notes: '',
  });

  const properties = db.getProperties();
  const assets = db.getAssets();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshOwners = () => {
    setOwnersList(db.getOwners());
  };

  // Filtered owners
  const filteredOwners = useMemo(() => {
    return ownersList.filter((owner) => {
      const matchesSearch =
        owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || owner.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ownersList, searchQuery, statusFilter]);

  // Overall Portfolio stats
  const totalValuation = useMemo(() => {
    return assets.reduce((sum, a) => sum + Number(a.purchase_cost || 0), 0);
  }, [assets]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '+251 9',
      address: 'Addis Ababa, Ethiopia',
      status: 'active',
      notes: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (owner: PropertyOwner, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      contact_person: owner.contact_person,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      status: owner.status,
      notes: owner.notes || '',
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill out Owner Name and Email.');
      return;
    }

    const created = db.addOwner({
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      status: formData.status,
      notes: formData.notes.trim() || 'Multi-property asset management agreement.',
    });

    refreshOwners();
    setIsCreateModalOpen(false);
    showToast(`Property Owner "${created.name}" created.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;

    db.updateOwner(editingOwner.id, {
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      status: formData.status,
      notes: formData.notes.trim(),
    });

    refreshOwners();
    setEditingOwner(null);
    showToast(`Owner "${formData.name}" updated successfully.`);
  };

  const handleDeleteOwner = (owner: PropertyOwner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = db.deleteOwner(owner.id);
    if (!result.success) {
      alert(result.reason || 'Cannot delete owner.');
      return;
    }

    refreshOwners();
    if (editingOwner?.id === owner.id) setEditingOwner(null);
    if (selectedOwnerDetail?.id === owner.id) setSelectedOwnerDetail(null);
    showToast(`Property Owner "${owner.name}" removed.`);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 mb-2">
            <Users className="w-3.5 h-3.5 text-neutral-900" />
            <span>Admin Workspace • Portfolio Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Property Owners
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Manage legal property owners, track associated apartment buildings, and audit asset valuations per portfolio.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property Owner</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Owners</div>
          <div className="text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">{ownersList.length}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {ownersList.filter((o) => o.status === 'active').length} active partnerships
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Buildings Managed</div>
          <div className="text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">{properties.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Across 3 Addis districts</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Asset Valuation</div>
          <div className="text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">
            {canViewFinancials ? formatCurrency(totalValuation) : 'Restricted'}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Under company management</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Tracked Assets</div>
          <div className="text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">{assets.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Appliances, furniture, MEP</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by owner name, contact person, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50/80 border border-neutral-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {(['all', 'active', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Owners Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => {
          const ownerProps = properties.filter((p) => p.owner_id === owner.id);
          const ownerAssets = assets.filter((a) => a.owner_id === owner.id);
          const ownerValuation = ownerAssets.reduce((sum, a) => sum + Number(a.purchase_cost || 0), 0);

          return (
            <div
              key={owner.id}
              onClick={() => setSelectedOwnerDetail(owner)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-950 font-extrabold flex items-center justify-center text-base border border-neutral-200 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                    {owner.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        owner.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          owner.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'
                        }`}
                      />
                      <span className="capitalize">{owner.status}</span>
                    </span>

                    <button
                      onClick={(e) => handleOpenEdit(owner, e)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors ml-1"
                      title="Edit Owner Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-neutral-950 text-lg mt-4 tracking-tight group-hover:text-black">
                  {owner.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {owner.notes || 'Exclusive property asset register.'}
                </p>

                {/* Contact snippets */}
                <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium text-neutral-800">{owner.contact_person}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{owner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-mono text-[11px]">{owner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate text-neutral-500">{owner.address}</span>
                  </div>
                </div>
              </div>

              {/* Bottom stats breakdown */}
              <div className="mt-6 pt-4 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Properties</div>
                    <div className="font-extrabold text-neutral-900 text-sm mt-0.5">
                      {ownerProps.length} {ownerProps.length === 1 ? 'Building' : 'Buildings'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50/70 border border-neutral-100">
                    <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Tracked Assets</div>
                    <div className="font-extrabold text-neutral-900 text-sm mt-0.5">
                      {ownerAssets.length} Assets
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                  <span>Portfolio Valuation:</span>
                  <span className="font-bold text-neutral-900">
                    {canViewFinancials ? formatCurrency(ownerValuation) : 'Restricted'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOwners.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-neutral-200/80 p-8">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h4 className="font-bold text-neutral-800 text-sm">No Property Owners Found</h4>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting your search or add a new property owner.</p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: CREATE NEW PROPERTY OWNER */}
      {/* ------------------------------------------------------------------ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-950 text-base">Register Property Owner</h3>
                <p className="text-xs text-neutral-500">Add an owner or legal entity holding managed properties</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Owner / Legal Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alula Real Estate PLC"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ato Alula Girma"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@alula.et"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+251 91 100 2200"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  >
                    <option value="active">Active Partnership</option>
                    <option value="archived">Archived / Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Office / Physical Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bole Road, Addis Ababa, Ethiopia"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Contract & Legal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="TIN number, contract reference, management fee percentage..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Property Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: EDIT PROPERTY OWNER */}
      {/* ------------------------------------------------------------------ */}
      {editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-950 text-base">Edit Property Owner</h3>
                <p className="text-xs text-neutral-500">{editingOwner.name}</p>
              </div>
              <button
                onClick={() => setEditingOwner(null)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Owner / Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteOwner(editingOwner)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                >
                  Delete Owner
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOwner(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* DRAWER / MODAL: OWNER PORTFOLIO DETAIL */}
      {/* ------------------------------------------------------------------ */}
      {selectedOwnerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-neutral-950 text-base">{selectedOwnerDetail.name}</h3>
                <p className="text-xs text-neutral-500">Portfolio & Asset Allocation Overview</p>
              </div>
              <button
                onClick={() => setSelectedOwnerDetail(null)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Linked Properties */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Registered Properties & Buildings
                </h4>

                <div className="space-y-3">
                  {properties
                    .filter((p) => p.owner_id === selectedOwnerDetail.id)
                    .map((prop) => {
                      const propAssets = assets.filter((a) => a.current_property_id === prop.id);
                      const propValuation = propAssets.reduce((sum, a) => sum + Number(a.purchase_cost || 0), 0);

                      return (
                        <div
                          key={prop.id}
                          className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="font-bold text-neutral-950 text-sm">{prop.name}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {prop.location?.name || 'Addis Ababa'} • {prop.total_apartments} Luxury Apartments
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-900 text-white">
                              {propAssets.length} Assets
                            </span>
                            <div className="text-[11px] font-medium text-neutral-500 mt-1">
                              {canViewFinancials ? formatCurrency(propValuation) : 'Restricted'}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {properties.filter((p) => p.owner_id === selectedOwnerDetail.id).length === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-neutral-200/60">
                      No buildings assigned to this owner yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl border border-neutral-200/80 space-y-2 text-xs">
                <div className="font-bold text-neutral-900 mb-2">Primary Contact Details</div>
                <div className="flex justify-between text-neutral-600">
                  <span className="text-neutral-400">Representative:</span>
                  <span className="font-medium text-neutral-800">{selectedOwnerDetail.contact_person}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="text-neutral-400">Email:</span>
                  <span className="font-mono text-neutral-800">{selectedOwnerDetail.email}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="text-neutral-400">Phone:</span>
                  <span className="font-mono text-neutral-800">{selectedOwnerDetail.phone}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="text-neutral-400">Address:</span>
                  <span className="text-neutral-800">{selectedOwnerDetail.address}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-neutral-200/80 bg-neutral-50/50 flex items-center justify-end shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setSelectedOwnerDetail(null)}
                className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
