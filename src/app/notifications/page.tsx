'use client';

import React from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, ShoppingCart, Wrench, ClipboardCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/formatters';

export default function NotificationsPage() {
  const notifications = db.getNotifications();
  const auditLogs = db.getAuditLogs();

  const handleMarkAll = () => {
    db.markAllNotificationsAsRead();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Notifications & Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            System alerts for pending approvals, low stock thresholds, warranty expirations, and immutable security audit trails.
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In-App Notifications */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active System Alerts</h2>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 transition-colors ${!notif.is_read ? 'bg-brand-50/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                  {!notif.is_read && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Protected Security Audit Trail</h2>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 capitalize">{log.action.replace('_', ' ')} • {log.entity_type}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDateTime(log.created_at)}</span>
                </div>
                <div className="text-slate-600 mt-1 font-mono text-[11px]">{log.record_identifier}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>User: {log.user_email || 'System Agent'}</span>
                  <span>IP: {log.ip_address || '127.0.0.1'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
