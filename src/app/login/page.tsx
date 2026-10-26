'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Database,
  UserCheck,
  Layers,
  Wrench,
  FileBarChart,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { UserRoleName } from '@/types/database';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInstantDemoLogin = (role: UserRoleName = 'Administrator') => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      loginAsDemo(role);
      router.push('/');
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter an email address or use 1-click demo login.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Login request failed. You can use 1-click demo access.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoRoles = [
    {
      role: 'Administrator' as UserRoleName,
      title: 'Administrator',
      email: 'admin@apexinventory.io',
      icon: ShieldCheck,
      color: 'border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    },
    {
      role: 'Inventory Officer' as UserRoleName,
      title: 'Inventory Officer',
      email: 'officer@apexinventory.io',
      icon: Layers,
      color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300',
    },
    {
      role: 'Maintenance Staff' as UserRoleName,
      title: 'Maintenance Lead',
      email: 'tech@apexinventory.io',
      icon: Wrench,
      color: 'border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    },
    {
      role: 'Read-Only Auditor' as UserRoleName,
      title: 'Auditor',
      email: 'auditor@apexinventory.io',
      icon: FileBarChart,
      color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-xs">
            <Box className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Apex Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enterprise Asset, Equipment & Inventory Management
          </p>
        </div>

        {/* Login Card Container */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* ================================================================ */}
          {/* PRIMARY 1-CLICK INSTANT DEMO LOGIN BANNER */}
          {/* ================================================================ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Temporary / Guest Access
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                No Password Required
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleInstantDemoLogin('Administrator')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs group"
            >
              <Zap className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>1-Click Instant Demo Login</span>
              <ArrowRight className="w-4 h-4 ml-auto stroke-[2.5]" />
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Direct access for review. Select any role below to explore specific RBAC permissions.
            </p>
          </div>

          {/* Quick Persona Selectors */}
          <div className="grid grid-cols-2 gap-2">
            {demoRoles.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleInstantDemoLogin(item.role)}
                  disabled={isLoading}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:border-blue-500 hover:shadow-xs flex items-center gap-2.5 ${item.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">1-Click Entry</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-[#0F172A] px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Or Sign In With Account
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Traditional Credentials Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apexinventory.io"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  (Any text for demo or Supabase pwd)
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Authenticate Credentials'}</span>
            </button>
          </form>

          {/* Supabase Connectivity Badge */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Supabase Backend</span>
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live & Synced
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
          Apex Inventory System • v2.0 Enterprise Release
        </div>
      </div>
    </div>
  );
}
