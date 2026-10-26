'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Keyboard,
  Plus,
  Search,
  Box,
  Layers,
  MapPin,
  Tag,
  Check,
  X,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/formatters';

export default function AccessoriesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const accessories = db.getAccessories();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = Array.from(new Set(accessories.map((a) => a.category)));

  const filtered = accessories.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.accessory_number.toLowerCase().includes(search.toLowerCase()) ||
      acc.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      (acc.model_number && acc.model_number.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || acc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
            <Keyboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Unit Hardware & Peripherals Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Accessories & Peripherals
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Track secondary peripherals paired with primary assets: remote controls, wall mounting brackets, cables, smart key fobs, and adapters.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Accessory</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search remote, bracket, model #, manufacturer..."
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
            All Categories ({accessories.length})
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

      {/* Accessories Table */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Tag</th>
                <th className="py-3.5 px-4">Accessory Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Manufacturer & Model</th>
                <th className="py-3.5 px-4 text-center">Total / Deployed</th>
                <th className="py-3.5 px-4">In Storage</th>
                <th className="py-3.5 px-4">Unit Value</th>
                <th className="py-3.5 px-4">Linked Asset</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded text-[11px] tabular-nums">
                      {acc.accessory_number}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{acc.location}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{acc.category}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {acc.manufacturer} <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] tabular-nums">({acc.model_number || 'Standard'})</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-white">{acc.total_qty}</span>
                    <span className="text-slate-500 text-[11px]"> ({acc.in_use_qty} deployed)</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{acc.storage_qty} in stock</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200 font-mono tabular-nums">
                    {formatCurrency(acc.unit_cost)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {acc.linked_asset_name ? (
                      <span className="text-slate-800 dark:text-slate-300 font-medium truncate block max-w-xs">
                        {acc.linked_asset_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        acc.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                      }`}
                    >
                      {acc.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New Accessory</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Accessory Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sony Bravia Backlit Bluetooth Voice Remote"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Quantity</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  showToast('Accessory logged to inventory registry.');
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#E91E63] text-white hover:bg-[#D81B60]"
              >
                Save Accessory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
