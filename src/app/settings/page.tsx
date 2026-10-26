'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Check,
  Building,
  Hash,
  ShieldCheck,
  Bell,
  Database,
  Download,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { db } from '@/lib/db';
import { CompanySettings } from '@/types/database';

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(() => db.getSettings());
  const [saved, setSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'numbering' | 'policies' | 'database'>('general');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportData = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      company: settings.company_name,
      settings: db.getSettings(),
      users: db.getUsers(),
      roles: db.getRoles(),
      owners: db.getOwners(),
      properties: db.getProperties(),
      apartments: db.getApartments(),
      assets: db.getAssets(),
      inventory: db.getInventoryItems(),
      purchaseOrders: db.getPurchaseOrders(),
      workOrders: db.getMaintenanceWorkOrders(),
      inspections: db.getInspections(),
      auditLogs: db.getAuditLogs(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex_inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetDatabase = () => {
    if (
      confirm(
        'WARNING: This will reset all assets, owners, work orders, and settings back to the initial sample data state. Are you sure?'
      )
    ) {
      setIsResetting(true);
      db.resetDemoData();
      setTimeout(() => {
        setIsResetting(false);
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 mb-2">
            <Settings className="w-3.5 h-3.5 text-neutral-900" />
            <span>Admin Workspace • System Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Company & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Configure enterprise identity, auto-numbering prefixes, operational approvals, and database backup controls.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 pb-3">
        {[
          { id: 'general', label: 'Company Profile', icon: Building },
          { id: 'numbering', label: 'Auto-Numbering Sequences', icon: Hash },
          { id: 'policies', label: 'Policies & Notifications', icon: Bell },
          { id: 'database', label: 'Data Management & Backup', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: GENERAL PROFILE */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-950">Company Profile & Operational Currency</h2>
              <p className="text-xs text-neutral-500">Legal business entity credentials shown on POs, reports, and invoices</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Official Contact Phone</label>
                <input
                  type="text"
                  value={settings.company_phone || ''}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Headquarters Operations Email</label>
                <input
                  type="email"
                  required
                  value={settings.company_email || ''}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Default Valuation Currency</label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                >
                  <option value="ETB">ETB - Ethiopian Birr (Br)</option>
                  <option value="USD">USD - United States Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Physical Office Address</label>
                <input
                  type="text"
                  value={settings.company_address || ''}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTO-NUMBERING */}
        {activeTab === 'numbering' && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-950">Auto-Numbering Sequences & Prefixes</h2>
              <p className="text-xs text-neutral-500">
                System-generated identifiers for asset tags, purchase orders, inspection tickets, and work orders
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <div className="text-xs font-bold text-neutral-900">Fixed Assets</div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={settings.asset_prefix}
                    onChange={(e) => setSettings({ ...settings, asset_prefix: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Next Sequence #</label>
                  <input
                    type="number"
                    value={settings.next_asset_number}
                    onChange={(e) => setSettings({ ...settings, next_asset_number: Number(e.target.value) })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Preview: {settings.asset_prefix}{settings.next_asset_number}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <div className="text-xs font-bold text-neutral-900">Purchase Orders</div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={settings.po_prefix}
                    onChange={(e) => setSettings({ ...settings, po_prefix: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Next Sequence #</label>
                  <input
                    type="number"
                    value={settings.next_po_number}
                    onChange={(e) => setSettings({ ...settings, next_po_number: Number(e.target.value) })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Preview: {settings.po_prefix}{settings.next_po_number}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <div className="text-xs font-bold text-neutral-900">Inspections</div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={settings.inspection_prefix}
                    onChange={(e) => setSettings({ ...settings, inspection_prefix: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Next Sequence #</label>
                  <input
                    type="number"
                    value={settings.next_inspection_number}
                    onChange={(e) => setSettings({ ...settings, next_inspection_number: Number(e.target.value) })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Preview: {settings.inspection_prefix}{settings.next_inspection_number}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <div className="text-xs font-bold text-neutral-900">Maintenance Orders</div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={settings.maintenance_prefix}
                    onChange={(e) => setSettings({ ...settings, maintenance_prefix: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Next Sequence #</label>
                  <input
                    type="number"
                    value={settings.next_maintenance_number}
                    onChange={(e) => setSettings({ ...settings, next_maintenance_number: Number(e.target.value) })}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 font-mono"
                  />
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Preview: {settings.maintenance_prefix}{settings.next_maintenance_number}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POLICIES & NOTIFICATIONS */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-950">Approval Policies & Notification Routing</h2>
              <p className="text-xs text-neutral-500">Governance workflows enforcing management sign-offs</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-neutral-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900">Purchase Order Formal Approval Rule</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Require Property Manager or Administrator sign-off before vendor PO can be issued
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.approval_rules?.require_po_approval ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      approval_rules: {
                        ...settings.approval_rules,
                        require_po_approval: e.target.checked,
                        require_transfer_approval: settings.approval_rules?.require_transfer_approval ?? true,
                        require_inspection_review: settings.approval_rules?.require_inspection_review ?? true,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900">Asset Inter-Property Transfer Sign-off</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Require approval before equipment or furniture can cross property boundaries
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.approval_rules?.require_transfer_approval ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      approval_rules: {
                        ...settings.approval_rules,
                        require_po_approval: settings.approval_rules?.require_po_approval ?? true,
                        require_transfer_approval: e.target.checked,
                        require_inspection_review: settings.approval_rules?.require_inspection_review ?? true,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900">Move-Out Discrepancy Review</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Flag inspections with missing or damaged items for mandatory audit sign-off
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.approval_rules?.require_inspection_review ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      approval_rules: {
                        ...settings.approval_rules,
                        require_po_approval: settings.approval_rules?.require_po_approval ?? true,
                        require_transfer_approval: settings.approval_rules?.require_transfer_approval ?? true,
                        require_inspection_review: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE & BACKUP */}
        {activeTab === 'database' && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Database Operations, Supabase & Master Backup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live cloud database connection, snapshot backups, and seed controls</p>
            </div>

            {/* Supabase Connection Status Card */}
            <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Supabase Cloud Database</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Endpoint: https://wfkdfhxehcbgxomlpxhx.supabase.co
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl self-start sm:self-center">
                  PostgreSQL 15+ Engine
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All asset additions, status changes, and user audits automatically replicate to your Supabase instance. Database schema is stored in <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">supabase/schema.sql</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                    <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Export JSON Snapshot</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Download a full JSON backup of all 55+ assets, work orders, users, and audit logs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Reset to Seed Data</span>
                  </div>
                  <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-1 leading-relaxed">
                    Reinitialize the entire database back to default facilities, work orders, and 55 fixed assets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDatabase}
                  disabled={isResetting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors self-start"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Resetting Data...' : 'Reset All Demo Data'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        {activeTab !== 'database' && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
