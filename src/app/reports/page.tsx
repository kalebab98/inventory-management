'use client';

import React, { useState, useMemo } from 'react';
import { FileBarChart, Download, Printer, Filter, Calendar, TrendingUp, Building2, ShieldCheck, DollarSign } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { MaintenanceWorkOrder } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function ReportsPage() {
  const { canViewFinancials } = useAuth();
  const owners = db.getOwners();
  const properties = db.getProperties();
  const stats = db.getDashboardStats();
  const assets = db.getAssets();
  const workOrders: MaintenanceWorkOrder[] = db.getMaintenanceWorkOrders();

  const [selectedReportType, setSelectedReportType] = useState('asset_register');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (selectedReportType === 'asset_register') {
      csvContent += "Asset Tag,Asset Name,Category,Property,Cost (ETB),Status\n";
      assets.forEach((a) => {
        csvContent += `"${a.asset_number}","${a.name}","${a.category?.name || ''}","${a.property?.name || ''}",${a.purchase_cost},"${a.status}"\n`;
      });
    } else {
      csvContent += "Work Order #,Issue Title,Cost (ETB),Technician,Completion Date\n";
      workOrders.forEach((wo) => {
        const techName = wo.request?.assigned_user?.full_name || wo.request?.vendor_name || 'Staff Technician';
        csvContent += `"${wo.work_order_number}","${wo.request?.issue_title || ''}",${wo.total_cost || 0},"${techName}","${wo.completion_date || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
            <FileBarChart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Portfolio Financial & Operational Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reports & Depreciation Statements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Audit-grade operational summaries, equipment valuation ledger, owner inventory reports, and repair cost balances.
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
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'asset_register', title: 'Complete Asset Register', count: `${stats.totalAssets} Items`, sub: 'Serialized equipment registry' },
          { id: 'owner_inventory', title: 'Inventory by Property Owner', count: `${stats.totalOwners} Owners`, sub: 'Asset custody distribution' },
          { id: 'maintenance_costs', title: 'Maintenance & Repairs Cost', count: canViewFinancials ? formatCurrency(stats.totalMaintenanceExpenditure) : 'Restricted', sub: 'Preventive & emergency costs' },
          { id: 'procurement', title: 'Purchasing & Capital Outlay', count: canViewFinancials ? formatCurrency(stats.totalPurchaseExpenditure) : 'Restricted', sub: 'Cumulative asset acquisition' },
        ].map((rep) => {
          const isSelected = selectedReportType === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReportType(rep.id)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/60 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500/60 shadow-xs ring-1 ring-blue-500/30'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {rep.title}
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1.5 tabular-nums">
                  {rep.count}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{rep.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Report Preview Table */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {selectedReportType === 'asset_register'
                ? 'Main Fixed Asset Schedule'
                : selectedReportType === 'maintenance_costs'
                ? 'Maintenance Expense Audit Schedule'
                : selectedReportType === 'owner_inventory'
                ? 'Owner Portfolio Inventory Statement'
                : 'Capital Expenditure Statement'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live ledger statement generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            Scope: All 3 Properties • Currency: ETB
          </div>
        </div>

        <div className="overflow-x-auto">
          {selectedReportType === 'maintenance_costs' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">WO Number</th>
                  <th className="py-3 px-4">Service Description</th>
                  <th className="py-3 px-4">Assigned Personnel</th>
                  <th className="py-3 px-4">Completion Date</th>
                  <th className="py-3 px-4 text-right">Service Cost (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {wo.work_order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                      {wo.request?.issue_title || 'Routine Maintenance'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {wo.request?.assigned_user?.full_name || wo.request?.vendor_name || 'Staff Facilities'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">
                      {formatDate(wo.completion_date || '2026-08-14')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-200 tabular-nums">
                      {canViewFinancials ? formatCurrency(wo.total_cost || 0) : 'Restricted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Asset Tag</th>
                  <th className="py-3 px-4">Equipment Model</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Book Cost (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assets.slice(0, 8).map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {asset.asset_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                      <div className="text-[11px] text-slate-500">{asset.brand} • {asset.model}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {asset.category?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {asset.property?.name} {asset.apartment ? `• Unit ${asset.apartment.unit_number}` : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 capitalize">
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-200 tabular-nums">
                      {canViewFinancials ? formatCurrency(asset.purchase_cost) : 'Restricted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Apex Multi-Family Asset Portfolio Engine • Certified Statement</span>
          <span className="font-mono tabular-nums">Showing sample slice • Use Export CSV for complete ledger</span>
        </div>
      </div>
    </div>
  );
}
