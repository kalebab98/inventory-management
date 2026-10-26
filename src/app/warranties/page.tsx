'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  Check,
  X,
  Phone,
  Building2,
  Calendar,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/formatters';

export default function WarrantiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const warranties = db.getWarranties();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = warranties.filter((w) => {
    const matchesSearch =
      w.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      w.contract_number.toLowerCase().includes(search.toLowerCase()) ||
      w.provider.toLowerCase().includes(search.toLowerCase()) ||
      w.asset_tag.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Guarantees, SLAs & Manufacturer Coverage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Warranties & Service Contracts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Audit manufacturer warranty periods, emergency technician SLAs, preventive maintenance agreements, and policy countdowns.
          </p>
        </div>

        <button
          onClick={() => showToast('Warranty registration unlocked.')}
          className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register Warranty</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset name, contract #, vendor provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: 'all', label: `All (${warranties.length})` },
            { id: 'active', label: 'Active Coverage' },
            { id: 'expiring_soon', label: 'Expiring < 60d' },
            { id: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((w) => {
          const isExpiringSoon = w.status === 'expiring_soon';
          return (
            <div
              key={w.id}
              className={`bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border p-5 shadow-sm dark:shadow-lg space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
                isExpiringSoon ? 'border-amber-300/80 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded text-[11px] tabular-nums">
                      {w.contract_number}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">{w.asset_tag}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">{w.asset_name}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>
                      {w.property_name} {w.unit_number ? `• ${w.unit_number}` : ''}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border font-mono tabular-nums ${
                    isExpiringSoon
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  }`}
                >
                  {w.days_remaining} Days Remaining
                </span>
              </div>

              {/* Countdown progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  <span>Start: {formatDate(w.start_date)}</span>
                  <span>Expires: {formatDate(w.expiry_date)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      isExpiringSoon
                        ? 'bg-amber-500 w-1/5'
                        : 'bg-blue-600 w-4/5'
                    }`}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-300">Coverage: {w.coverage_type}</span>
                  <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{w.sla_hours}h SLA</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{w.terms_summary}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>{w.provider}: {w.provider_contact}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <Link
                  href={`/assets/${w.asset_id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>Inspect Asset Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {isExpiringSoon && (
                  <button
                    onClick={() => showToast(`Vendor dispatch sent to ${w.provider} for renewal.`)}
                    className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 rounded-xl font-bold text-xs"
                  >
                    Request SLA Renewal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
