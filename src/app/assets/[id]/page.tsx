'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  ArrowLeft,
  Wrench,
  ShieldCheck,
  FileText,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Download,
  Barcode,
  QrCode,
  Edit2,
  Trash2,
  Printer,
  ExternalLink,
  ChevronRight,
  Clock,
  User,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { Asset, AssetStatus, AssetCondition } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canViewFinancials } = useAuth();
  const assetId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'info' | 'warranty' | 'components' | 'maintenance'>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Maintenance Log Modal
  const [isLogMaintenanceOpen, setIsLogMaintenanceOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: 'Routine Inspection & Diagnostic',
    description: 'Hardware diagnostic test, filter cleaning, and firmware verification.',
    priority: 'medium',
    cost: 1500,
  });

  const asset = useMemo(() => {
    return db.getAssetById(assetId) || db.getAssets()[0];
  }, [assetId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!asset) {
    return (
      <div className="py-20 text-center space-y-4">
        <Box className="w-12 h-12 text-slate-700 mx-auto" />
        <h2 className="text-lg font-bold text-white">Asset Record Not Found</h2>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Asset Register</span>
        </Link>
      </div>
    );
  }

  const handleQuickStatusChange = (newStatus: AssetStatus) => {
    db.updateAssetStatus(asset.id, newStatus);
    showToast(`Asset status updated to ${newStatus.replace('_', ' ')}.`);
  };

  const handleLogMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addAuditLog({
      user_id: 'usr-1',
      user_email: 'admin@apexproperties.et',
      action: 'create',
      entity_type: 'maintenance_work_order',
      record_identifier: `${asset.asset_number} Maintenance Ticket`,
      change_details: maintenanceForm,
    });
    db.updateAssetStatus(asset.id, 'under_maintenance', maintenanceForm.title);
    setIsLogMaintenanceOpen(false);
    showToast(`Maintenance ticket logged for ${asset.asset_number}.`);
  };

  // Mock Components & Accessories
  const components = [
    { name: 'Original Infrared Remote Control', partNo: 'RC-SON-43', condition: 'Good', serial: 'SN-RC-8812' },
    { name: 'Solid Heavy-Duty VESA Wall Bracket', partNo: 'WB-VESA-400', condition: 'Excellent', serial: 'SN-WB-4401' },
    { name: 'Premium Braided 4K HDMI Cable (2m)', partNo: 'CBL-HDMI-4K', condition: 'New', serial: 'CBL-8891' },
    { name: 'UL Certified AC Power Supply Adapter', partNo: 'PWR-SON-19V', condition: 'Good', serial: 'SN-PWR-192' },
  ];

  // Mock Maintenance History Trail
  const maintenanceHistory = [
    {
      id: 'm-1',
      date: '2026-08-14',
      title: 'Annual Performance Diagnostic & Firmware Update',
      technician: 'Yohannes Haile (Senior Facilities)',
      cost: 1800,
      status: 'Completed',
      notes: 'Cleaned intake cooling array, calibrated display color profile, verified smart home IoT relay.',
    },
    {
      id: 'm-2',
      date: '2026-03-10',
      title: 'Initial Tenant Move-In Inspection & Wall Mount Anchor Test',
      technician: 'Dawit Tadesse (Inventory Controller)',
      cost: 0,
      status: 'Verified',
      notes: 'Mounted securely in Living Room entertainment recess. Barcode registered and tenant sign-off obtained.',
    },
  ];

  // Image Fallback
  const photoUrl =
    asset.photo_url ||
    (asset.name.toLowerCase().includes('tv')
      ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=900&auto=format&fit=crop&q=80'
      : asset.name.toLowerCase().includes('refrigerator')
      ? 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=900&auto=format&fit=crop&q=80'
      : asset.name.toLowerCase().includes('air')
      ? 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=80');

  return (
    <div className="space-y-6 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Assets</span>
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ASSET HEADER CARD */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs tabular-nums">
              {asset.asset_number}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                asset.status === 'assigned'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : asset.status === 'in_stock'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="capitalize">{asset.status.replace('_', ' ')}</span>
            </span>

            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Barcode: {asset.barcode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {asset.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                {asset.property?.name || 'Bole Royal Residences'} •{' '}
                {asset.apartment ? `Unit ${asset.apartment.unit_number}` : 'Central Storage'}
              </span>
            </div>
            <span>•</span>
            <span>Category: {asset.category?.name || 'Appliances'}</span>
            <span>•</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Brand: {asset.brand} ({asset.model})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => setIsLogMaintenanceOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Log Maintenance</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print Tag</span>
          </button>

          <button
            onClick={() => {
              const toggled = asset.status === 'assigned' ? 'in_stock' : 'assigned';
              handleQuickStatusChange(toggled);
            }}
            className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <span>{asset.status === 'assigned' ? 'Move to Storage' : 'Deploy to Unit'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN TWO-PANE LAYOUT */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: TABBED DETAILS (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
          {/* Glassmorphic Tabs Navigation */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto text-xs">
            {[
              { id: 'info', label: 'Asset Details & Specs', icon: FileText },
              { id: 'warranty', label: 'Warranties & Receipts', icon: ShieldCheck },
              { id: 'components', label: 'Components & Parts', icon: Layers },
              { id: 'maintenance', label: 'Maintenance Audit Trail', icon: Wrench },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* TAB 1: INFO & SPECS */}
            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Brand & Manufacturer</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{asset.brand}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Model Number</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{asset.model}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Serial Number</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white text-sm mt-0.5 block tabular-nums">
                        {asset.serial_number}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Physical Condition</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 capitalize text-sm mt-0.5 block">
                        {asset.condition} (Fully Operational)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Financial & Procurement Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Acquisition Cost</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">
                        {canViewFinancials ? formatCurrency(asset.purchase_cost) : 'Restricted'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Purchase Date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                        {formatDate(asset.purchase_date)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Assigned Property Owner</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                        {asset.owner?.name || 'Alula Real Estate PLC'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 block text-[11px]">Supplier / Vendor</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block">
                        Addis Commercial Electronics Import
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Operational Notes
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                    {asset.notes || 'Configured for executive long-term lease. Integrated with tenant smart energy sub-metering.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: WARRANTIES & RECEIPTS */}
            {activeTab === 'warranty' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Countdown Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Active Manufacturer Warranty
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-mono">
                      520 Days Remaining
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-3/4 rounded-full" />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>Started: {formatDate(asset.warranty_start || '2026-01-15')}</span>
                    <span>Expires: {formatDate(asset.warranty_expiry || '2028-02-15')}</span>
                  </div>
                </div>

                {/* Terms Breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Coverage Scope</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    <li>Full parts and certified technician labor covered by local manufacturer branch.</li>
                    <li>Power surge protection and compressor replacement warranty.</li>
                    <li>Turnaround SLA: 48-hour dispatched repair or complete unit replacement.</li>
                  </ul>
                </div>

                {/* Uploaded Receipt Document Simulator */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Attached Invoices & Proof of Purchase
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-200 dark:border-rose-500/20">
                        PDF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Official_Tax_Invoice_{asset.asset_number}.pdf
                        </div>
                        <div className="text-[11px] text-slate-500">
                          1.4 MB • Uploaded on purchase date • Certified Tax TIN Receipt
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast('Downloading invoice PDF simulation...')}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COMPONENTS & ACCESSORIES */}
            {activeTab === 'components' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Linked Sub-Components & Accessories ({components.length})
                  </h3>
                  <button
                    onClick={() => showToast('Component addition unlocked.')}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Sub-Part</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950/60">
                  {components.map((comp) => (
                    <div key={comp.partNo} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{comp.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Part No: {comp.partNo} • Serial: {comp.serial}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          {comp.condition}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MAINTENANCE AUDIT TRAIL */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Chronological Repair & Service History
                  </h3>
                  <button
                    onClick={() => setIsLogMaintenanceOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>New Ticket</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {maintenanceHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{item.notes}</p>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Technician: {item.technician}</span>
                        <span className="font-mono">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: HIGH-RES PHOTO & BARCODE (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          {/* High Resolution Physical Asset Photo */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm dark:shadow-xl space-y-4 overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Physical Asset Image & Verification
            </div>

            <div className="w-full h-72 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative group">
              <img
                src={photoUrl}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-semibold text-white">Physical asset verified during inspection</span>
              </div>
            </div>

            {/* Barcode & QR Code Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Asset Tracking Tag
                </div>
                <div className="font-mono font-bold text-lg text-slate-900 dark:text-white mt-1">
                  {asset.asset_number}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                  {asset.barcode}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white text-slate-950 shrink-0 shadow-md border border-slate-200">
                <QrCode className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Quick Location & Occupancy Card */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Assigned Residence Deployment
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Building:</span>
                <span className="font-bold text-slate-900 dark:text-white">{asset.property?.name || 'Bole Royal Residences'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Apartment Unit:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {asset.apartment ? `Unit ${asset.apartment.unit_number}` : 'Central Depot'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Room Location:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {asset.name.toLowerCase().includes('tv') ? 'Living Room Media Wall' : 'Kitchen Area'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">District:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Bole District, Addis Ababa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: LOG MAINTENANCE WORK ORDER */}
      {/* ------------------------------------------------------------------ */}
      {isLogMaintenanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Log Maintenance Ticket</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{asset.asset_number} • {asset.name}</p>
              </div>
              <button
                onClick={() => setIsLogMaintenanceOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogMaintenanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title / Service Request <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technician Diagnostic Notes
                </label>
                <textarea
                  rows={3}
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={maintenanceForm.priority}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Cost (ETB)
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogMaintenanceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
