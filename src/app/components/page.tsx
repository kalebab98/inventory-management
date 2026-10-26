'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Cpu,
  Plus,
  Search,
  Box,
  MapPin,
  Check,
  X,
  ExternalLink,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function ComponentsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const components = db.getComponents();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = Array.from(new Set(components.map((c) => c.category)));

  const filtered = components.filter((cmp) => {
    const matchesSearch =
      cmp.name.toLowerCase().includes(search.toLowerCase()) ||
      cmp.component_number.toLowerCase().includes(search.toLowerCase()) ||
      cmp.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      cmp.serial_number.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || cmp.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Sub-Assemblies & Modular Spare Parts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Components & Hardware Sub-Parts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Track sub-parts that are installed inside major fixed assets: AC compressors, TV processor boards, dishwasher circulation motors, and plumbing mixer cartridges.
          </p>
        </div>

        <button
          onClick={() => showToast('Component registration form opened.')}
          className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Component</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search component name, serial #, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-800'
            }`}
          >
            All Categories ({components.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Tag</th>
                <th className="py-3.5 px-4">Component Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Manufacturer & Serial</th>
                <th className="py-3.5 px-4">Compatible Equipment</th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th className="py-3.5 px-4">Current Location / Installed</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((cmp) => (
                <tr key={cmp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] tabular-nums">
                      {cmp.component_number}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{cmp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{cmp.manufacturer}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{cmp.category}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px] tabular-nums">
                    {cmp.serial_number}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {cmp.compatible_models}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200 font-mono tabular-nums">
                    {formatCurrency(cmp.cost)}
                  </td>
                  <td className="py-3 px-4">
                    {cmp.status === 'installed' ? (
                      <div>
                        <div className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{cmp.installed_asset_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono tabular-nums">
                          Installed: {cmp.installed_date}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{cmp.location}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        cmp.status === 'installed'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30'
                      }`}
                    >
                      {cmp.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
