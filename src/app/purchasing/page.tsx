'use client';

import React from 'react';
import { ShoppingCart, Plus, CheckCircle, Clock, FileText } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/formatters';

export default function PurchasingPage() {
  const { canApprovePurchases } = useAuth();

  const purchaseOrders = db.getPurchaseOrders();
  const purchaseRequests = db.getPurchaseRequests();
  const suppliers = db.getSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Suppliers & Purchasing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Procurement workflows: purchase requests, executive approvals, PO tracking, and goods receipt.
          </p>
        </div>

        <button
          onClick={() => alert('Phase 3 will unlock the Purchase Request creation modal.')}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Request</span>
        </button>
      </div>

      {/* Purchase Requests */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Purchase Requests Requiring Action</h2>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4">Status</th>
                {canApprovePurchases && <th className="py-3 px-4 text-right">Approval Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseRequests.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{pr.request_number}</td>
                  <td className="py-3 px-4 text-slate-700">{pr.requested_by?.full_name}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">{pr.purpose}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(pr.total_estimated_cost)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        pr.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </td>
                  {canApprovePurchases && (
                    <td className="py-3 px-4 text-right">
                      {pr.status === 'pending' ? (
                        <button
                          onClick={() => alert(`Approved ${pr.request_number}`)}
                          className="px-2.5 py-1 bg-brand-600 text-white rounded text-[11px] font-semibold hover:bg-brand-500 shadow-2xs"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Signed Off</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Issued Purchase Orders</h2>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">PO Status</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{po.po_number}</td>
                  <td className="py-3 px-4 text-slate-700">{po.supplier?.name}</td>
                  <td className="py-3 px-4 text-slate-600">{po.issue_date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(po.total_amount)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        po.status === 'received'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        po.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {po.payment_status}
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
