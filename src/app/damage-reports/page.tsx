'use client';

import React from 'react';
import { AlertTriangle, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { db } from '@/lib/db';

export default function DamageReportsPage() {
  const damageReports = db.getDamageReports();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Damage Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged asset damages, photographic evidence, severity classifications, and maintenance work order links.
          </p>
        </div>

        <button
          onClick={() => alert('Phase 3 will unlock Damage Report creation modal.')}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Report Damage</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {damageReports.map((dmg) => (
          <div key={dmg.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-brand-700">{dmg.report_number}</span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                {dmg.severity} Severity
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-bold text-slate-900 text-sm">{dmg.asset?.name}</h3>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{dmg.asset?.asset_number}</div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{dmg.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Reported by: <strong className="text-slate-700">{dmg.reported_by?.full_name}</strong></span>
              <span>Status: <strong className="text-amber-700 capitalize">{dmg.status.replace('_', ' ')}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
