import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Building2, Bell, Shield, Plus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

import UserMenu from './UserMenu';

interface HeaderProps {
  onOpenNewRecordModal: () => void;
  onToggleNotifications: () => void;
  unreadNotifCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewRecordModal,
  onToggleNotifications,
  unreadNotifCount
}) => {
  const { currentUser, companies, selectedCompanyScope, setSelectedCompanyScope, switchUserRole } = useAuth();

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Company Scope Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Tenant Scope:</span>
        </div>
        <select
          value={selectedCompanyScope}
          onChange={(e) => setSelectedCompanyScope(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <option value="all">🏢 All Enterprise Subsidiaries</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions, Role Selector, Theme & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Quick New Record Button */}
        <button
          onClick={onOpenNewRecordModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs hover:shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">+ New Compliance</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Role Simulator Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden md:inline">Role:</span>
          <select
            value={currentUser?.role || 'super_admin'}
            onChange={(e) => switchUserRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="super_admin">Super Admin</option>
            <option value="compliance_officer">Compliance Officer</option>
            <option value="company_admin">Company Admin</option>
            <option value="auditor">Auditor (Read-Only)</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Button */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Notifications & Reminders"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs">
              {unreadNotifCount}
            </span>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
};

