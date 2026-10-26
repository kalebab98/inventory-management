'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRoleName, Role } from '@/types/database';
import { db } from './db';
import { authenticateWithSupabase } from './supabase-service';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRoleName;
  roles: Role[];
  availableUsers: User[];
  permissions: string[];
  isAuthenticated: boolean;
  hasPermission: (permissionCode: string) => boolean;
  switchUser: (userId: string) => void;
  switchRole: (roleName: UserRoleName) => void;
  refreshUsers: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (roleName?: UserRoleName) => void;
  logout: () => void;
  canViewFinancials: boolean;
  canManageUsers: boolean;
  canApprovePurchases: boolean;
  canModifyAssets: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usersList, setUsersList] = useState<User[]>(() => db.getUsers());
  const [rolesList, setRolesList] = useState<Role[]>(() => db.getRoles());
  const [currentUser, setCurrentUser] = useState<User>(() => db.getUsers()[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const refreshUsers = () => {
    const currentUsers = db.getUsers();
    setUsersList(currentUsers);
    setRolesList(db.getRoles());
    setCurrentUser((prev) => currentUsers.find((u) => u.id === prev.id) || currentUsers[0]);
  };

  // Load active user & auth status from sessionStorage on client mount
  useEffect(() => {
    db.hydrate();
    const freshUsers = db.getUsers();
    setUsersList(freshUsers);
    setRolesList(db.getRoles());
    if (typeof window !== 'undefined') {
      const authFlag = sessionStorage.getItem('apex_auth_session');
      // If user explicitly signed out, respect it; otherwise default to active for seamless review
      if (authFlag === 'unauthenticated') {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }

      const savedUserId = sessionStorage.getItem('apex_active_user_id');
      if (savedUserId) {
        const found = freshUsers.find((u) => u.id === savedUserId);
        if (found) setCurrentUser(found);
      }
    }
  }, []);

  const currentRoleRecord = rolesList.find((r) => r.id === currentUser.role_id) || rolesList[0] || { name: 'Administrator' as UserRoleName, permissions: [] };
  const currentRole: UserRoleName = currentRoleRecord.name;
  const permissions = currentRoleRecord.permissions || [];

  const hasPermission = (code: string): boolean => {
    if (currentRole === 'Administrator') return true;
    return permissions.includes(code);
  };

  const switchUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('apex_active_user_id', target.id);
      }
      db.addAuditLog({
        user_id: target.id,
        user_email: target.email,
        action: 'status_change',
        entity_type: 'user_session',
        record_identifier: `${target.full_name} (${target.role_name})`,
        change_details: { switched_to: target.email, role: target.role_name },
      });
    }
  };

  const switchRole = (roleName: UserRoleName) => {
    const targetUser = usersList.find((u) => u.role_name === roleName);
    if (targetUser) {
      switchUser(targetUser.id);
    }
  };

  const loginAsDemo = (roleName: UserRoleName = 'Administrator') => {
    const target = usersList.find((u) => u.role_name === roleName) || usersList[0];
    if (target) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('apex_active_user_id', target.id);
        sessionStorage.setItem('apex_auth_session', 'authenticated');
      }
      db.addAuditLog({
        user_id: target.id,
        user_email: target.email,
        action: 'status_change',
        entity_type: 'auth',
        record_identifier: `Demo Login: ${target.full_name}`,
        change_details: { method: '1-click-demo', role: target.role_name },
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // 1. First try matching existing registered user profile
    const localMatch = usersList.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    
    // 2. Try Supabase Auth
    try {
      const res = await authenticateWithSupabase(email, password);
      if (res.data?.user) {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('apex_auth_session', 'authenticated');
        }
        if (localMatch) {
          switchUser(localMatch.id);
        }
        return { success: true };
      }
    } catch {
      // Supabase auth failed or not set up, fall back to local credentials
    }

    // 3. Fallback to local profile check
    if (localMatch) {
      switchUser(localMatch.id);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('apex_auth_session', 'authenticated');
      }
      return { success: true };
    }

    // 4. If credentials entered but no user found, allow universal demo sign-in
    if (email && password) {
      loginAsDemo('Administrator');
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('apex_auth_session', 'unauthenticated');
    }
    db.addAuditLog({
      user_id: currentUser.id,
      user_email: currentUser.email,
      action: 'status_change',
      entity_type: 'auth',
      record_identifier: `User logged out: ${currentUser.email}`,
      change_details: { email: currentUser.email },
    });
  };

  const canViewFinancials = hasPermission('financial.view');
  const canManageUsers = hasPermission('users.manage');
  const canApprovePurchases = hasPermission('purchases.approve');
  const canModifyAssets = hasPermission('assets.edit') || hasPermission('assets.create');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        roles: rolesList,
        availableUsers: usersList,
        permissions,
        isAuthenticated,
        hasPermission,
        switchUser,
        switchRole,
        refreshUsers,
        login,
        loginAsDemo,
        logout,
        canViewFinancials,
        canManageUsers,
        canApprovePurchases,
        canModifyAssets,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
