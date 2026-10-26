'use client';

import React from 'react';
import { ClipboardCheck, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';

export default function InspectionsPage() {
  const inspections = db.getInspections();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Inspections & Audits</h1>
          <p className="text-xs text-slate-500 mt-1">
            Move-in, move-out, routine verification, and discrepancy review before adjusting registers.
          </p>
        </div>

        <button
          onClick={() => alert('Phase 3 will unlock Inspection creation modal.')}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3 px-4">Inspection #</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Property & Unit</th>
              <th className="py-3 px-4">Inspector</th>
              <th className="py-3 px-4">Discrepancies</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspections.map((ins) => (
              <tr key={ins.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{ins.inspection_number}</td>
                <td className="py-3 px-4 capitalize text-slate-700">{ins.inspection_type.replace('_', ' ')}</td>
                <td className="py-3 px-4 text-slate-800 font-medium">
                  {ins.property?.name} {ins.apartment ? `• ${ins.apartment.unit_number}` : ''}
                </td>
                <td className="py-3 px-4 text-slate-600">{ins.inspector?.full_name}</td>
                <td className="py-3 px-4">
                  {(ins.discrepancies_count || 0) > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      {ins.discrepancies_count} Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Clean Match
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                      ins.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {ins.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
