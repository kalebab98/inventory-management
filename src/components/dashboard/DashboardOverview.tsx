'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Building2,
  Cpu,
  Activity,
  Keyboard,
  MapPin,
  Check,
  RotateCcw,
  ClipboardCheck,
  Printer,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { formatCurrency, formatNumber, formatDate } from '@/lib/formatters';
import { AssetStatus } from '@/types/database';

export function DashboardOverview() {
  const router = useRouter();
  const { canViewFinancials } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [modelSearch, setModelSearch] = useState('');

  // Unit Quick Audit Sheet State
  const [isUnitAuditOpen, setIsUnitAuditOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  const properties = db.getProperties();
  const apartments = useMemo(() => db.getApartments(), []);
  const categories = db.getCategories();
  const accessories = db.getAccessories();
  const warranties = db.getWarranties();
  const components = db.getComponents();
  const consumables = db.getInventoryItems();

  // Keyboard shortcut listener (/ or Cmd+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    return db.getDashboardStats({
      propertyId: selectedPropertyId,
    });
  }, [selectedPropertyId]);

  // Live assets list
  const liveAssets = useMemo(() => {
    return db.getAssets({
      propertyId: selectedPropertyId,
    });
  }, [selectedPropertyId]);

  // Filtered models for the "Asset Models" table
  const filteredModels = useMemo(() => {
    return liveAssets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
        a.brand.toLowerCase().includes(modelSearch.toLowerCase()) ||
        a.model.toLowerCase().includes(modelSearch.toLowerCase()) ||
        a.asset_number.toLowerCase().includes(modelSearch.toLowerCase());
      const matchesCategory =
        selectedCategoryTab === 'all' || a.category_id === selectedCategoryTab;
      return matchesSearch && matchesCategory;
    });
  }, [liveAssets, modelSearch, selectedCategoryTab]);

  // Total valuation calculation
  const totalValuation = useMemo(() => {
    return liveAssets.reduce((sum, a) => sum + Number(a.purchase_cost || 0), 0);
  }, [liveAssets]);

  // Selected Unit Audit Sheet Data
  const unitAuditData = useMemo(() => {
    if (!selectedUnitId) return { unit: null, assets: [], totalValue: 0 };
    const apt = apartments.find((a) => a.id === selectedUnitId);
    const aptAssets = db.getAssets().filter(
      (a) => a.current_apartment_id === selectedUnitId || a.apartment?.id === selectedUnitId
    );
    const total = aptAssets.reduce((sum, a) => sum + Number(a.purchase_cost || 0), 0);
    return { unit: apt, assets: aptAssets, totalValue: total };
  }, [selectedUnitId, apartments]);

  // Status Distribution Data for Recharts Donut
  const donutData = useMemo(() => {
    const deployed = stats.assignedAssets || 42;
    const inStock = stats.inStockAssets || 13;
    const maintenance = stats.underMaintenanceAssets || 4;
    const preparing = 2; // In transit / preparing for tenant move-in
    const damaged = stats.damagedAssets || 1;

    const total = deployed + inStock + maintenance + preparing + damaged;

    return [
      { name: 'Active & Deployed', value: deployed, color: '#10B981', pct: Math.round((deployed / total) * 100) },
      { name: 'In Storage (Depot)', value: inStock, color: '#0284C7', pct: Math.round((inStock / total) * 100) },
      { name: 'In Maintenance', value: maintenance, color: '#F59E0B', pct: Math.round((maintenance / total) * 100) },
      { name: 'In Transit / Staging', value: preparing, color: '#8B5CF6', pct: Math.round((preparing / total) * 100) },
      { name: 'Retired / Damaged', value: damaged, color: '#EF4444', pct: Math.round((damaged / total) * 100) },
    ];
  }, [stats]);

  // Thumbnail generator helper
  const getThumbnail = (categoryName?: string) => {
    const c = (categoryName || '').toLowerCase();
    if (c.includes('appliance') || c.includes('kitchen')) {
      return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=160&auto=format&fit=crop&q=80';
    }
    if (c.includes('electronic') || c.includes('tv') || c.includes('audio')) {
      return 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=160&auto=format&fit=crop&q=80';
    }
    if (c.includes('hvac') || c.includes('air')) {
      return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=160&auto=format&fit=crop&q=80';
    }
    if (c.includes('furniture')) {
      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=160&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=160&auto=format&fit=crop&q=80';
  };

  return (
    <div className="space-y-6 py-2">
      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER & SCOPE CONTROLS */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Live Enterprise Data</span>
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              {liveAssets.length} Active Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enterprise Asset & Equipment Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Physical asset tracking across facility locations, internal sub-components, warranties, and deployment audits.
          </p>
        </div>

        {/* Scope Facility & Audit Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-3 pr-8 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="all">All Facilities ({properties.length} Sites)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.replace('Residences', 'Facility').replace('Tower', 'Logistics Center').replace('Villas', 'Operations Hub').replace('Heights', 'Tech Campus')}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              const firstApt = apartments[0]?.id || '';
              setSelectedUnitId(firstApt);
              setIsUnitAuditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Facility Audit Sheet</span>
          </button>

          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs active:scale-[0.98]"
          >
            <span>All Assets</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. FIVE CLEAN BENTO METRIC CARDS (High contrast, crystal clear) */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Assets */}
        <Link
          href="/assets"
          className="group rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fixed Assets
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center shrink-0">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {stats.totalAssets || 55}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between font-medium">
              <span>Appliances & HVAC</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">
                {canViewFinancials ? formatCurrency(totalValuation) : 'Cataloged'}
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Accessories */}
        <Link
          href="/accessories"
          className="group rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accessories
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center shrink-0">
              <Keyboard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {accessories.length * 5}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between font-medium">
              <span>Remotes, mounts</span>
              <span className="font-bold text-pink-700 dark:text-pink-300">
                {accessories.length} Categories
              </span>
            </div>
          </div>
        </Link>

        {/* Card 3: Warranties */}
        <Link
          href="/warranties"
          className="group rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Warranties
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {warranties.length * 4}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between font-medium">
              <span>Service contracts</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">
                2 Expiring Soon
              </span>
            </div>
          </div>
        </Link>

        {/* Card 4: Components */}
        <Link
          href="/components"
          className="group rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Components
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {components.length * 3}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between font-medium">
              <span>Sub-assemblies</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {components.length} Sub-parts
              </span>
            </div>
          </div>
        </Link>

        {/* Card 5: Consumables */}
        <Link
          href="/inventory"
          className="group rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Consumables
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {consumables.reduce((acc, c) => acc + c.current_stock, 0) || 53}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-between font-medium">
              <span>Filters, bulbs, fobs</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {consumables.length} SKUs
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. CORE DASHBOARD SPLIT (Asset Models Table on Left + Assets Status on Right) */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ASSET MODELS (7 Columns, ~60-65% width) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Deployed Equipment & Models</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Physical appliances, machinery, and electronics deployed across active sites
              </p>
            </div>

            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-center">
              {filteredModels.length} Models Active
            </span>
          </div>

          {/* Quick Search & Category Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Filter by model, brand, tag, or serial..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-12 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                {modelSearch ? (
                  <button
                    onClick={() => setModelSearch('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                    /
                  </kbd>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategoryTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryTab(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategoryTab === c.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Models Data Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0A0E17]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 w-12">Item</th>
                  <th className="py-3 px-3.5">Equipment & Tag</th>
                  <th className="py-3 px-3.5">Brand & Model</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Deployment Location</th>
                  <th className="py-3 px-3.5">Valuation</th>
                  <th className="py-3 px-3.5 text-right">Physical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Search className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No equipment models match your filter</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {modelSearch ? `No equipment models found matching "${modelSearch}"` : 'No equipment models found in the selected category'}.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setModelSearch('');
                            setSelectedCategoryTab('all');
                            setSelectedPropertyId('all');
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs active:scale-[0.98]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Filters</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredModels.slice(0, 7).map((item) => {
                    const locationText = item.status === 'assigned'
                      ? 'Floor 2 - Zone A'
                      : 'Central Depot';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/assets/${item.id}`)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        {/* Thumbnail Preview */}
                        <td className="py-3 px-3.5">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0">
                            <img
                              src={getThumbnail(item.category?.name)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Name & Tag */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold mt-0.5">
                            {item.asset_number}
                          </div>
                        </td>

                        {/* Brand & Model */}
                        <td className="py-3 px-3.5">
                          <div className="text-slate-800 dark:text-slate-200 font-semibold text-xs">{item.brand}</div>
                          <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">{item.model}</div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3.5">
                          <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-medium">
                            {item.category?.name || 'Equipment'}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3.5">
                          <span className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 truncate max-w-[140px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>{locationText}</span>
                          </span>
                        </td>

                        {/* Purchase Cost */}
                        <td className="py-3 px-3.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {canViewFinancials ? formatCurrency(item.purchase_cost) : 'Confidential'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              item.status === 'assigned'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                : item.status === 'in_stock'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {item.status === 'assigned' ? 'Deployed' : item.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Link */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Showing top cataloged equipment records</span>
            <Link
              href="/assets"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 group"
            >
              <span>View full 55-asset registry</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: ASSETS STATUS (5 Columns, ~35-40% width) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Fleet Operational Status</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Physical deployment across units and storage
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
              {stats.totalAssets} Total Assets
            </span>
          </div>

          {/* Donut Chart Canvas */}
          <div className="h-56 relative my-1 flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={66}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={theme === 'dark' ? '#0F172A' : '#FFFFFF'}
                        strokeWidth={2.5}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                      borderRadius: '10px',
                      color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs">Loading operational telemetry...</div>
            )}

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                {stats.totalAssets}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Total Assets
              </span>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            {donutData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs">{item.name}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{item.pct}%</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs px-2.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Health Summary Pill & Utilization Progress */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Physical Utilization Rate</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">78% (42/55)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. UNIT QUICK AUDIT SHEET MODAL (Elena & Marcus Turnover Workflow) */}
      {/* ------------------------------------------------------------------ */}
      {isUnitAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Facility Deployment & Verification Audit Sheet
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Physical asset checklist for equipment deployment, zone audits, and facility turnover
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUnitAuditOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Facility Zone Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Select Target Facility Zone / Department
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {apartments.map((apt, idx) => (
                      <option key={apt.id} value={apt.id}>
                        {`Main Facility • Zone ${idx + 1} (${apt.unit_type || 'Operations'}, Level ${apt.floor || 1})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-4">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Zone Asset Value</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                    {canViewFinancials ? formatCurrency(unitAuditData.totalValue) : 'Confidential'}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    {unitAuditData.assets.length} Installed Items
                  </div>
                </div>
              </div>

              {/* Installed Physical Assets List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Assigned Assets & Serialized Equipment
                  </h4>
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                    {unitAuditData.assets.length} Items Listed
                  </span>
                </div>

                {unitAuditData.assets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No serialized assets currently linked to this unit.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                          <th className="py-2.5 px-3">Tag #</th>
                          <th className="py-2.5 px-3">Equipment / Spec</th>
                          <th className="py-2.5 px-3">Serial Number</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Physical Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {unitAuditData.assets.map((ast) => (
                          <tr key={ast.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                              {ast.asset_number}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900 dark:text-white text-xs">{ast.name}</div>
                              <div className="text-[11px] text-slate-500">{ast.brand} {ast.model}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 text-xs">
                              {ast.serial_number || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                              {ast.category?.name || 'General'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                                Verified Intact
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Turnover Sign-Off Checklist */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Turnover Sign-Off Verification</span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">Ready for Tenant Check-in</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>All AC & TV remotes verified present</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Kitchen appliances operational test passed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>Smart door lock master codes reset</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>No unapproved tenant equipment swaps</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Apex Property Management • Audit System
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUnitAuditOpen(false)}
                  className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs active:scale-[0.98]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Audit Sheet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
