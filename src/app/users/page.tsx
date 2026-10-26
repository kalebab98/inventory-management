'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  Lock,
  Phone,
  Mail,
  Briefcase,
  UserCheck,
  AlertCircle,
  Sliders,
  CheckSquare,
  Square,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { User, UserRoleName, Role } from '@/types/database';

// All standard permission codes in the system
const ALL_PERMISSIONS = [
  { code: 'assets.view', label: 'View Assets', category: 'Assets' },
  { code: 'assets.create', label: 'Register Assets', category: 'Assets' },
  { code: 'assets.edit', label: 'Edit Asset Details', category: 'Assets' },
  { code: 'assets.delete', label: 'Decommission / Delete', category: 'Assets' },
  { code: 'assets.assign', label: 'Assign to Unit', category: 'Assets' },
  { code: 'assets.transfer', label: 'Transfer Assets', category: 'Assets' },
  { code: 'assets.dispose', label: 'Dispose Assets', category: 'Assets' },
  { code: 'owners.manage', label: 'Manage Owners', category: 'Portfolio' },
  { code: 'properties.manage', label: 'Manage Buildings', category: 'Portfolio' },
  { code: 'inventory.manage', label: 'Consumable Stock', category: 'Operations' },
  { code: 'inventory.adjust', label: 'Manual Stock Adjust', category: 'Operations' },
  { code: 'purchases.create', label: 'Create PO / Requests', category: 'Purchasing' },
  { code: 'purchases.approve', label: 'Approve Purchases', category: 'Purchasing' },
  { code: 'purchases.receive', label: 'Receive Orders', category: 'Purchasing' },
  { code: 'maintenance.manage', label: 'Manage Work Orders', category: 'Maintenance' },
  { code: 'maintenance.approve', label: 'Approve Repairs', category: 'Maintenance' },
  { code: 'inspections.manage', label: 'Conduct Inspections', category: 'Inspections' },
  { code: 'inspections.approve', label: 'Approve Inspection Review', category: 'Inspections' },
  { code: 'financial.view', label: 'View Financial Valuations', category: 'Security' },
  { code: 'reports.export', label: 'Export Reports', category: 'Security' },
  { code: 'users.manage', label: 'Manage Staff & Roles', category: 'Security' },
  { code: 'settings.manage', label: 'Company Settings', category: 'Security' },
  { code: 'audit.view', label: 'View Immutable Audit Trail', category: 'Security' },
];

export default function UsersPage() {
  const { availableUsers, roles, switchUser, currentUser, refreshUsers } = useAuth();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for New / Edit User
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    job_title: '',
    role_id: roles[0]?.id || 'role-admin',
    is_active: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrator':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Property Manager':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Inventory Officer':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Maintenance Staff':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Read-Only Auditor':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '+251 9',
      job_title: '',
      role_id: roles[0]?.id || 'role-admin',
      is_active: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      job_title: user.job_title || '',
      role_id: user.role_id,
      is_active: user.is_active,
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      alert('Please fill out full name and email.');
      return;
    }

    const assignedRole = roles.find((r) => r.id === formData.role_id) || roles[0];

    db.addUser({
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      job_title: formData.job_title.trim() || 'Operations Staff',
      role_id: assignedRole.id,
      role_name: assignedRole.name,
      avatar_url: undefined,
      is_active: formData.is_active,
    });

    refreshUsers();
    setIsCreateModalOpen(false);
    showToast(`Staff member "${formData.full_name}" added successfully.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const assignedRole = roles.find((r) => r.id === formData.role_id) || roles[0];

    db.updateUser(editingUser.id, {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      job_title: formData.job_title.trim(),
      role_id: assignedRole.id,
      role_name: assignedRole.name,
      is_active: formData.is_active,
    });

    refreshUsers();
    setEditingUser(null);
    showToast(`Staff account "${formData.full_name}" updated.`);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete your own active session account.');
      return;
    }
    const adminCount = availableUsers.filter((u) => u.role_name === 'Administrator').length;
    if (user.role_name === 'Administrator' && adminCount <= 1) {
      alert('Cannot delete the last Administrator account.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.full_name}? This action is recorded in the audit log.`)) {
      db.deleteUser(user.id);
      refreshUsers();
      if (editingUser?.id === user.id) setEditingUser(null);
      showToast(`Staff member "${user.full_name}" removed.`);
    }
  };

  // Toggle permission in the matrix modal
  const handleTogglePermission = (role: Role, permCode: string) => {
    const current = role.permissions || [];
    let updated: string[];
    if (current.includes(permCode)) {
      updated = current.filter((p) => p !== permCode);
    } else {
      updated = [...current, permCode];
    }

    const updatedRole = db.updateRolePermissions(role.id, updated);
    if (updatedRole) {
      setSelectedRoleForPermissions({ ...updatedRole });
      refreshUsers();
      showToast(`Updated permissions for ${role.name}`);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
            <span>Admin Workspace • Access Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Staff & Role Permissions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Manage authorized staff accounts, assign granular role-based permissions, and test role-specific workflows in real time.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Staff</div>
          <div className="text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">{availableUsers.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Across 3 Addis offices</div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Active Accounts</div>
          <div className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-2">
            {availableUsers.filter((u) => u.is_active).length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">100% operational</div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Roles Configured</div>
          <div className="text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">{roles.length}</div>
          <div className="text-xs text-neutral-500 mt-1">RBAC matrix active</div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Administrators</div>
          <div className="text-3xl font-extrabold text-purple-700 tracking-tight mt-2">
            {availableUsers.filter((u) => u.role_name === 'Administrator').length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Full access rights</div>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-950">Company Staff Accounts</h2>
            <p className="text-xs text-neutral-500">Authorized personnel who can sign in to the inventory platform</p>
          </div>
          <div className="text-xs text-neutral-400">
            {availableUsers.length} registered accounts
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200/80 text-neutral-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Job Title</th>
                <th className="py-3 px-5">Assigned Role</th>
                <th className="py-3 px-5">Phone Number</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70">
              {availableUsers.map((user) => {
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-neutral-50/80 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {user.full_name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-950 text-sm tracking-tight flex items-center gap-2">
                            <span>{user.full_name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-neutral-700 font-medium">
                      {user.job_title}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeColor(
                          user.role_name || ''
                        )}`}
                      >
                        {user.role_name}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-neutral-600 font-mono text-[11px]">
                      {user.phone || '—'}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          user.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.is_active ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isCurrent ? (
                          <span className="text-[11px] font-semibold text-neutral-400 px-2 py-1">
                            Current Session
                          </span>
                        ) : (
                          <button
                            onClick={() => switchUser(user.id)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-[11px] transition-colors"
                            title="Simulate this user's view"
                          >
                            Test as User
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit user details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={isCurrent}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrent
                              ? 'text-neutral-300 cursor-not-allowed'
                              : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={isCurrent ? 'Cannot delete active session' : 'Delete user'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles & Permissions Governance Matrix */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200/80">
          <div>
            <h2 className="text-base font-bold text-neutral-950">Role Permissions Governance Matrix</h2>
            <p className="text-xs text-neutral-500">
              Select any role below to view, audit, and customize the granular access permissions granted to that role.
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            {roles.length} roles active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((role) => {
            const userCount = availableUsers.filter((u) => u.role_id === role.id).length;
            const permCount = role.permissions?.length || 0;

            return (
              <div
                key={role.id}
                className="bg-neutral-50/60 rounded-xl border border-neutral-200/80 p-5 flex flex-col justify-between hover:border-neutral-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeColor(
                        role.name
                      )}`}
                    >
                      {role.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {userCount} {userCount === 1 ? 'user' : 'users'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Privileges:</span>
                    <span className="font-bold text-neutral-900">
                      {role.name === 'Administrator' ? 'Full Unrestricted' : `${permCount} Permissions`}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-200/60">
                  <button
                    onClick={() => setSelectedRoleForPermissions(role)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-colors shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Configure Permissions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: CREATE NEW STAFF MEMBER */}
      {/* ------------------------------------------------------------------ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-950 text-base">Add Staff Member</h3>
                <p className="text-xs text-neutral-500">Create an authorized user with role-based access</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solomon Mengistu"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="solomon@apexproperties.et"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+251 91 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Property Manager"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="create_is_active" className="text-xs text-neutral-700 font-medium">
                  Active account (eligible to sign in and perform actions)
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: EDIT STAFF MEMBER */}
      {/* ------------------------------------------------------------------ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-950 text-base">Edit Staff Account</h3>
                <p className="text-xs text-neutral-500">{editingUser.email}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <label htmlFor="edit_is_active" className="text-xs text-neutral-700 font-medium">
                    Account is Active
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                >
                  Delete Staff Member
                </button>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ROLE PERMISSION MATRIX CONFIGURATOR */}
      {/* ------------------------------------------------------------------ */}
      {selectedRoleForPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-neutral-950 text-base">
                    Configure Permissions: {selectedRoleForPermissions.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(
                      selectedRoleForPermissions.name
                    )}`}
                  >
                    {selectedRoleForPermissions.name}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Check or uncheck privileges. Changes take effect across all users assigned to this role.
                </p>
              </div>
              <button
                onClick={() => setSelectedRoleForPermissions(null)}
                className="p-1 text-neutral-400 hover:text-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {['Assets', 'Portfolio', 'Operations', 'Purchasing', 'Maintenance', 'Inspections', 'Security'].map(
                (category) => {
                  const perms = ALL_PERMISSIONS.filter((p) => p.category === category);
                  if (perms.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {category} Privileges
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isAssigned = (selectedRoleForPermissions.permissions || []).includes(p.code);
                          const isAdminRole = selectedRoleForPermissions.name === 'Administrator';

                          return (
                            <button
                              key={p.code}
                              type="button"
                              disabled={isAdminRole}
                              onClick={() => handleTogglePermission(selectedRoleForPermissions, p.code)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                                isAssigned
                                  ? 'bg-neutral-900 text-white border-neutral-900'
                                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                              } ${isAdminRole ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                              <div className="shrink-0">
                                {isAssigned ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-neutral-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">{p.label}</div>
                                <div className={`text-[10px] font-mono truncate ${isAssigned ? 'text-neutral-400' : 'text-neutral-400'}`}>
                                  {p.code}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="px-6 py-3 border-t border-neutral-200/80 bg-neutral-50/50 flex items-center justify-between shrink-0">
              <span className="text-xs text-neutral-500">
                {selectedRoleForPermissions.permissions?.length || 0} active permissions
              </span>
              <button
                type="button"
                onClick={() => setSelectedRoleForPermissions(null)}
                className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
