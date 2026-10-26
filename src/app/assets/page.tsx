'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Search,
  Filter,
  Plus,
  Download,
  Barcode,
  Layers,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ExternalLink,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ChevronDown,
  MoreVertical,
  Wrench,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { Asset, AssetCondition, AssetStatus } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

export default function AssetsPage() {
  const router = useRouter();
  const { canViewFinancials } = useAuth();

  // State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState('all');

  // Multi-select / Bulk Actions
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Column Visibility Config
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'image', label: 'Thumbnail', visible: true },
    { id: 'name', label: 'Item Name', visible: true },
    { id: 'tag', label: 'Asset Tag', visible: true },
    { id: 'category', label: 'Category', visible: true },
    { id: 'location', label: 'Unit / Room Assignment', visible: true },
    { id: 'model', label: 'Brand & Model', visible: true },
    { id: 'serial', label: 'Serial Number', visible: false },
    { id: 'cost', label: 'Purchase Cost', visible: true },
    { id: 'warranty', label: 'Warranty Expiry', visible: true },
    { id: 'status', label: 'Status Badge', visible: true },
  ]);

  // New Asset Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssetData, setNewAssetData] = useState({
    name: '',
    category_id: 'cat-2', // Appliances default
    brand: '',
    model: '',
    serial_number: '',
    purchase_cost: 45000,
    condition: 'excellent' as AssetCondition,
    status: 'assigned' as AssetStatus,
    current_property_id: 'prop-1',
    current_apartment_id: 'apt-101',
    warranty_expiry: '2028-06-30',
  });

  const categories = db.getCategories();
  const properties = db.getProperties();
  const apartments = db.getApartments();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const assets = useMemo(() => {
    return db.getAssets({
      search,
      categoryId: selectedCategory,
      status: selectedStatus as AssetStatus,
      propertyId: selectedProperty,
    });
  }, [search, selectedCategory, selectedStatus, selectedProperty]);

  const toggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const isColVisible = (id: string) => {
    return columns.find((c) => c.id === id)?.visible ?? true;
  };

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedAssetIds.length === assets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map((a) => a.id));
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchStatusUpdate = (status: AssetStatus) => {
    if (selectedAssetIds.length === 0) return;
    const count = db.batchUpdateAssetStatus(selectedAssetIds, status);
    setSelectedAssetIds([]);
    showToast(`Updated ${count} assets to ${status.replace('_', ' ')}.`);
  };

  const handleExportCSV = () => {
    const exportSet = selectedAssetIds.length > 0
      ? assets.filter((a) => selectedAssetIds.includes(a.id))
      : assets;

    const headers = [
      'Asset Tag',
      'Name',
      'Category',
      'Brand',
      'Model',
      'Serial Number',
      'Barcode',
      'Property',
      'Unit Assignment',
      'Status',
      'Condition',
      'Purchase Cost',
      'Warranty Expiry',
    ];

    const rows = exportSet.map((a) => [
      a.asset_number,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category?.name || '',
      a.brand,
      a.model,
      a.serial_number,
      a.barcode,
      a.property?.name || '',
      a.apartment ? `Unit ${a.apartment.unit_number}` : 'Central Storage',
      a.status,
      a.condition,
      a.purchase_cost,
      a.warranty_expiry,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `assetos_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${exportSet.length} assets to CSV.`);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetData.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    const created = db.createAsset({
      name: newAssetData.name,
      category_id: newAssetData.category_id,
      brand: newAssetData.brand,
      model: newAssetData.model,
      serial_number: newAssetData.serial_number,
      purchase_cost: newAssetData.purchase_cost,
      condition: newAssetData.condition,
      status: newAssetData.status,
      current_property_id: newAssetData.current_property_id,
      current_apartment_id: newAssetData.current_apartment_id,
      warranty_expiry: newAssetData.warranty_expiry,
    });

    setIsAddModalOpen(false);
    showToast(`Asset "${created.name}" registered as ${created.asset_number}.`);
  };

  // Status Badge Class Generator
  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'assigned':
        return {
          label: 'Deployed',
          classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
        };
      case 'in_stock':
        return {
          label: 'In Storage',
          classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30',
        };
      case 'under_maintenance':
        return {
          label: 'In Repair',
          classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30',
        };
      case 'missing':
      case 'disposed':
        return {
          label: status === 'missing' ? 'Missing' : 'Retired',
          classes: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30',
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30',
        };
    }
  };

  // Thumbnail fallback image generator based on category
  const getThumbnail = (categoryName?: string) => {
    const c = (categoryName || '').toLowerCase();
    if (c.includes('appliance') || c.includes('kitchen')) {
      return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=120&auto=format&fit=crop&q=80';
    }
    if (c.includes('electronic') || c.includes('tv') || c.includes('audio')) {
      return 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=120&auto=format&fit=crop&q=80';
    }
    if (c.includes('hvac') || c.includes('air')) {
      return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&auto=format&fit=crop&q=80';
    }
    if (c.includes('furniture')) {
      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120&auto=format&fit=crop&q=80';
  };

  return (
    <div className="space-y-6 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HEADER & TOP CONTROLS */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
            <Box className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Asset Lifecycle Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Main Asset Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Centralized registry for physical appliances, HVAC systems, furniture, and serialized equipment across residential units.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SEARCH, CATEGORY PILLS & COLUMN SELECTOR BAR */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm dark:shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, asset tag (AST-), serial #, model, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Property Filter */}
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Properties ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Deployed (In Unit)</option>
              <option value="in_stock">In Storage</option>
              <option value="under_maintenance">In Maintenance</option>
              <option value="missing">Missing / Stolen</option>
            </select>

            {/* Custom Column Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Columns</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {isColumnDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
                    Toggle Table Columns
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pt-2">
                    {columns.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs text-left text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span>{col.label}</span>
                        {col.visible ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mr-1 shrink-0">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories ({assets.length})
          </button>
          {categories.map((c) => {
            const count = assets.filter((a) => a.category_id === c.id).length;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FLOATING BULK ACTIONS TOOLBAR (Appears when rows selected) */}
      {/* ------------------------------------------------------------------ */}
      {selectedAssetIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-white dark:bg-[#0F172A] border border-blue-500/40 rounded-2xl px-5 py-3 shadow-xl dark:shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black">
              {selectedAssetIds.length}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">Assets Selected</span>
            <button
              onClick={() => setSelectedAssetIds([])}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline ml-1"
            >
              Clear selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBatchStatusUpdate('assigned')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              Mark Deployed
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('in_stock')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              Mark In Storage
            </button>
            <button
              onClick={() => handleBatchStatusUpdate('under_maintenance')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              Mark Maintenance
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MAIN INVENTORY DATA TABLE */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    {selectedAssetIds.length === assets.length && assets.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    )}
                  </button>
                </th>

                {isColVisible('image') && <th className="py-3.5 px-3 w-16">Preview</th>}
                {isColVisible('tag') && <th className="py-3.5 px-4">Asset Tag</th>}
                {isColVisible('name') && <th className="py-3.5 px-4">Asset Name</th>}
                {isColVisible('category') && <th className="py-3.5 px-4">Category</th>}
                {isColVisible('location') && <th className="py-3.5 px-4">Deployment Location</th>}
                {isColVisible('model') && <th className="py-3.5 px-4">Brand / Model</th>}
                {isColVisible('serial') && <th className="py-3.5 px-4 font-mono">Serial Number</th>}
                {isColVisible('cost') && <th className="py-3.5 px-4">Cost (ETB)</th>}
                {isColVisible('warranty') && <th className="py-3.5 px-4">Warranty</th>}
                {isColVisible('status') && <th className="py-3.5 px-4">Status</th>}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {assets.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                const badge = getStatusBadge(asset.status);
                const locationSnippet = asset.status === 'assigned'
                  ? `Main Facility • Zone ${asset.apartment?.unit_number || 'A-1'}`
                  : 'Central Storage Depot';

                return (
                  <tr
                    key={asset.id}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleRow(asset.id, e)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Image Thumbnail */}
                    {isColVisible('image') && (
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0 relative group-hover:border-blue-500/50 transition-colors">
                          <img
                            src={getThumbnail(asset.category?.name)}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </td>
                    )}

                    {/* Asset Tag */}
                    {isColVisible('tag') && (
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded text-[11px] tabular-nums">
                          {asset.asset_number}
                        </span>
                      </td>
                    )}

                    {/* Asset Name */}
                    {isColVisible('name') && (
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {asset.brand} • {asset.model}
                        </div>
                      </td>
                    )}

                    {/* Category */}
                    {isColVisible('category') && (
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {asset.category?.name || 'General Equipment'}
                      </td>
                    )}

                    {/* Unit Assignment */}
                    {isColVisible('location') && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate max-w-xs">{locationSnippet}</span>
                        </div>
                      </td>
                    )}

                    {/* Brand & Model */}
                    {isColVisible('model') && (
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {asset.brand} <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">({asset.model})</span>
                      </td>
                    )}

                    {/* Serial Number */}
                    {isColVisible('serial') && (
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {asset.serial_number || 'N/A'}
                      </td>
                    )}

                    {/* Cost */}
                    {isColVisible('cost') && (
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">
                        {canViewFinancials ? formatCurrency(asset.purchase_cost) : 'Restricted'}
                      </td>
                    )}

                    {/* Warranty Expiry */}
                    {isColVisible('warranty') && (
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                        {formatDate(asset.warranty_expiry)}
                      </td>
                    )}

                    {/* Status Badge */}
                    {isColVisible('status') && (
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>
                    )}

                    {/* Actions Menu */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View detailed asset sheet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => {
                            const newStatus: AssetStatus =
                              asset.status === 'assigned' ? 'in_stock' : 'assigned';
                            db.updateAssetStatus(asset.id, newStatus);
                            showToast(`Status updated to ${newStatus}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Quick toggle status"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {assets.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Box className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto mb-2" />
            <div className="font-bold text-slate-700 dark:text-slate-300">No physical assets found</div>
            <p className="mt-1">Try modifying your search or scope filters above.</p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: REGISTER NEW ASSET */}
      {/* ------------------------------------------------------------------ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Register New Physical Asset</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Deploy a serialized appliance, fixture, or interior asset</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item / Asset Name <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung Bespoke 4-Door Refrigerator 620L"
                  value={newAssetData.name}
                  onChange={(e) => setNewAssetData({ ...newAssetData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newAssetData.category_id}
                    onChange={(e) => setNewAssetData({ ...newAssetData, category_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung, LG, Bosch"
                    value={newAssetData.brand}
                    onChange={(e) => setNewAssetData({ ...newAssetData, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RF29BB8600"
                    value={newAssetData.model}
                    onChange={(e) => setNewAssetData({ ...newAssetData, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serial Number (Unique Tag)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-SAM-10292"
                    value={newAssetData.serial_number}
                    onChange={(e) => setNewAssetData({ ...newAssetData, serial_number: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Facility / Site
                  </label>
                  <select
                    value={newAssetData.current_property_id}
                    onChange={(e) => setNewAssetData({ ...newAssetData, current_property_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.replace('Residences', 'Facility').replace('Tower', 'Logistics Center').replace('Villas', 'Operations Hub').replace('Heights', 'Tech Campus')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deployment Zone / Department
                  </label>
                  <select
                    value={newAssetData.current_apartment_id}
                    onChange={(e) => setNewAssetData({ ...newAssetData, current_apartment_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    <option value="">Central Depot / Unassigned</option>
                    {apartments.map((a, idx) => (
                      <option key={a.id} value={a.id}>
                        Zone {idx + 1} - Floor {a.floor || 1} ({a.unit_type || 'Operations'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Cost (ETB)
                  </label>
                  <input
                    type="number"
                    value={newAssetData.purchase_cost}
                    onChange={(e) => setNewAssetData({ ...newAssetData, purchase_cost: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newAssetData.warranty_expiry}
                    onChange={(e) => setNewAssetData({ ...newAssetData, warranty_expiry: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0047b3] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Save & Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
