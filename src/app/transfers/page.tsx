'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Building2, Plus, Calendar, UserCheck, Check, X } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/formatters';

export default function TransfersPage() {
  const assets = db.getAssets();
  const properties = db.getProperties();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sampleTransfers = [
    {
      id: 'trf-1',
      asset_number: 'AST-1003',
      asset_name: 'Custom Italian Top-Grain Leather Sectional Sofa',
      from_location: 'Bole Royal - Unit 102',
      to_location: 'Bole Royal - Unit 101 (Living Room)',
      date: '2026-08-10',
      reason: 'Upgrading Unit 101 layout for diplomatic lease move-in.',
      staff: 'Dawit Tadesse',
      approver: 'Sara Mengistu',
      status: 'approved',
    },
    {
      id: 'trf-2',
      asset_number: 'AST-1007',
      asset_name: 'Panasonic Inverter Microwave Oven 32L',
      from_location: 'Central Storage Shelf C',
      to_location: 'Bole Royal - Unit 202 (Kitchen)',
      date: '2026-06-15',
      reason: 'Furnishing kitchen appliance array for incoming tenant.',
      staff: 'Dawit Tadesse',
      approver: 'Abebe Bikila',
      status: 'approved',
    },
    {
      id: 'trf-3',
      asset_number: 'AST-1011',
      asset_name: 'Daikin Inverter Split AC 12000 BTU',
      from_location: 'Bole Central Warehouse',
      to_location: 'Kazanchis Executive Towers - Unit 302',
      date: '2026-10-23',
      reason: 'Scheduled installation in newly finished studio unit.',
      staff: 'Yohannes Haile',
      approver: 'Pending Approval',
      status: 'pending',
    },
  ];

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
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Custody Chain & Chain of Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Asset Transfers & Chain of Custody
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Complete transaction ledger preserving previous locations and preventing duplicate active unit assignments.
          </p>
        </div>

        <button
          onClick={() => showToast('Transfer order workflow initialized.')}
          className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Asset Details</th>
                <th className="py-3.5 px-4">Origin (From)</th>
                <th className="py-3.5 px-4">Destination (To)</th>
                <th className="py-3.5 px-4">Movement Reason</th>
                <th className="py-3.5 px-4">Responsible Personnel</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sampleTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{t.asset_name}</div>
                    <div className="text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded inline-block mt-1 tabular-nums">
                      {t.asset_number}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{t.from_location}</td>
                  <td className="py-3.5 px-4 text-slate-900 dark:text-slate-200 font-medium">{t.to_location}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs">{t.reason}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <div className="font-medium">{t.staff}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 tabular-nums">Date: {t.date}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        t.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                      }`}
                    >
                      {t.status}
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
