'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Box,
  Layers,
  ArrowLeftRight,
  ShoppingCart,
  ClipboardCheck,
  Wrench,
  FileBarChart,
  Bell,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  RefreshCw,
  Plus,
  Keyboard,
  Cpu,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Database,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { db } from '@/lib/db';
import { UserRoleName } from '@/types/database';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentRole, availableUsers, switchUser, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // If on login page, render clean login view without dashboard chrome
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const notifications = db.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navigationSections = [
    {
      title: 'Asset Registry',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'All Assets', href: '/assets', icon: Box },
        { name: 'Accessories', href: '/accessories', icon: Keyboard },
        { name: 'Components & Parts', href: '/components', icon: Cpu },
        { name: 'Warranties & Contracts', href: '/warranties', icon: ShieldCheck },
        { name: 'Consumables Stock', href: '/inventory', icon: Layers },
      ],
    },
    {
      title: 'Operations',
      items: [
        { name: 'Maintenance & Repairs', href: '/maintenance', icon: Wrench },
        { name: 'Asset Transfers', href: '/transfers', icon: ArrowLeftRight },
        { name: 'Audits & Inspections', href: '/inspections', icon: ClipboardCheck },
        { name: 'Purchasing & Orders', href: '/purchasing', icon: ShoppingCart },
      ],
    },
    {
      title: 'Governance & System',
      items: [
        { name: 'Reports & Telemetry', href: '/reports', icon: FileBarChart },
        { name: 'User Management', href: '/users', icon: Users },
        { name: 'System Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const handleResetData = () => {
    if (confirm('Reset demo data to initial state? This reloads sample owners, 55+ fixed assets, and work orders.')) {
      setIsResetting(true);
      db.resetDemoData();
      setTimeout(() => {
        setIsResetting(false);
        window.location.reload();
      }, 400);
    }
  };

  const getRoleBadgeColor = (role: UserRoleName) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
      case 'Property Manager':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'Inventory Officer':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
      case 'Maintenance Staff':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'Read-Only Auditor':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150" suppressHydrationWarning>
      <div className="flex flex-1 relative">
        {/* ------------------------------------------------------------------ */}
        {/* SIDEBAR NAVIGATION */}
        {/* ------------------------------------------------------------------ */}
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] transition-all duration-200 select-none relative ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Circular Divider Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-5 z-30 w-6 h-6 rounded-full bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shadow-xs transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Brand Logo Header */}
          <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:bg-blue-700 transition-colors">
                <Box className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              {!isSidebarCollapsed && (
                <div className="leading-tight">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5">
                    <span>Apex</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Assets</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Enterprise Inventory</div>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Items List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      (item.href === '/' && (pathname === '/' || pathname === '/dashboard')) ||
                      (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isSidebarCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/90 dark:border-blue-800/60 font-semibold shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                        {!isSidebarCollapsed && (
                          <div className="flex-1 flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar User Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
            <div
              className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-300 dark:border-slate-700">
                {currentUser.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden leading-tight flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentRole}</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE NAVIGATION DRAWER */}
        {/* ------------------------------------------------------------------ */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 h-full flex flex-col z-10 shadow-2xl">
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                    <Box className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Apex Assets</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {navigationSections.map((section) => (
                  <div key={section.title}>
                    <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* MAIN VIEWPORT CONTAINER */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Header */}
          <header className="h-16 bg-white/95 dark:bg-[#0F172A]/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Facilities Scope Summary Badge */}
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Facilities Scope: Central Logistics • 55 Assets Tracked</span>
              </div>

              {/* Supabase Connected Indicator */}
              <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Supabase Live</span>
              </div>
            </div>

            {/* Global Search and Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Quick Search */}
              <div className="relative hidden md:block w-64 lg:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search assets, tags, serials, units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  ⌘K
                </kbd>
              </div>

              {/* Direct Quick Add CTA */}
              <Link
                href="/assets"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs transition-all active:scale-[0.98] shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Register Asset</span>
              </Link>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
                    <div className="px-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">System Alerts & Logs</div>
                      <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            !notif.is_read ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Recent</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all activity & notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu with Role Context and Persona Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs border border-slate-300 dark:border-slate-700">
                    {currentUser.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{currentUser.full_name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(currentRole)}`}>
                          {currentRole}
                        </span>
                      </div>
                    </div>

                    {/* Simulation Role Switcher inside Profile Menu */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
                      <label htmlFor="user-persona-switcher" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Switch Persona (RBAC Test)
                      </label>
                      <select
                        id="user-persona-switcher"
                        value={currentUser.id}
                        onChange={(e) => switchUser(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                      >
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.role_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="py-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        System Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleResetData();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
                        Reset Demo Data
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                          router.push('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border-t border-slate-100 dark:border-slate-800/80 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Body Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
