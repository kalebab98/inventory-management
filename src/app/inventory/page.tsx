'use client';

import React from 'react';
import { PackageSearch, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/formatters';

export default function InventoryPage() {
  const items = db.getInventoryItems();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Quantity-Based Consumables</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking maintenance supplies, light bulbs, filters, and chemicals kept separate from fixed assets.
          </p>
        </div>

        <button
          onClick={() => alert('Phase 3 will unlock Consumable Stock item registration modal.')}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Current Quantity</th>
                <th className="py-3 px-4">Min Threshold</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isLow = item.current_stock <= item.min_stock_level;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.storage_location}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.current_stock} {item.unit_of_measure}s
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.min_stock_level} {item.unit_of_measure}s
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {formatCurrency(item.unit_cost)}
                    </td>
                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Sufficient Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
