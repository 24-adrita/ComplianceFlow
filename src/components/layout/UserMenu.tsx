import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, LogOut, ChevronDown, Sun, Moon, Shield, Building2, Briefcase, Mail, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../providers/ThemeProvider';
import Modal from '../ui/Modal';
import { Company } from '../../types';

export const UserMenu: React.FC = () => {
  const { user, currentUser, logout, tenantCompany } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeUser = user || currentUser;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!activeUser) return null;

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  const handleToggleTheme = () => {
    setTheme(nextTheme);
  };

  const formattedRole = (activeUser.role || 'SUPER_ADMIN').replace('_', ' ');

  const getCompanyName = (companyId: string | Company | null | undefined, fallback: string) => {
    if (companyId && typeof companyId === 'object') {
      return companyId.name;
    }
    return fallback;
  };

  // Get user's company and department details safely
  const companyName = tenantCompany?.name
    || getCompanyName(activeUser.companyId, activeUser.companyName)
    || 'Global Enterprise Systems Inc.';

  const departmentName = (activeUser as any)?.department
    || (activeUser.departmentId && typeof activeUser.departmentId === 'object' && activeUser.departmentId !== null
        ? activeUser.departmentId.name
        : 'Compliance & Governance');

  const userAvatarUrl = activeUser.avatarUrl || (activeUser as any).avatar;

  return (
    <>
      <div className="relative">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`User account menu for ${activeUser.name}`}
          className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ring-2 ring-slate-500/20 group-hover:ring-slate-500/40 transition-all border border-slate-700/60">
            <UserIcon className="w-4 h-4 text-slate-200" aria-hidden="true" />
          </div>
          
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {activeUser.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              {formattedRole}
            </p>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />

              {/* Enterprise Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                role="menu"
                aria-orientation="vertical"
                aria-label="User account options"
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 origin-top-right overflow-hidden transition-colors"
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-2xs shrink-0 border border-slate-700/60">
                      <UserIcon className="w-5 h-5 text-slate-200" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {activeUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {activeUser.email}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                        <Shield className="w-3 h-3 text-blue-500" aria-hidden="true" />
                        <span>{formattedRole}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Items Section */}
                <div className="p-1.5 space-y-1">
                  {/* Item 1: My Profile */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90 rounded-xl flex items-center justify-between font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors">
                        <UserIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </div>
                      <span>My Profile</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">View</span>
                  </button>

                  {/* Item 2: Theme Toggle */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleToggleTheme();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90 rounded-xl flex items-center justify-between font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 text-slate-500 group-hover:text-amber-600 dark:text-slate-400 dark:group-hover:text-amber-400 transition-colors">
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                        ) : (
                          <Moon className="w-4 h-4 text-slate-700 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <span>Theme</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>

                {/* Divider & Item 3: Sign Out */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 p-1.5 mt-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center justify-between font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 transition-colors">
                        <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </div>
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Lightweight Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="User Profile"
        description="Enterprise compliance account details and authorization scope."
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* Header Profile Summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={activeUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 truncate">
                {activeUser.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                {activeUser.email}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/90 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>{formattedRole}</span>
              </div>
            </div>
          </div>

          {/* Read-Only Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-blue-500" /> Full Name
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {activeUser.name}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {activeUser.email}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Enterprise Subsidiary
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {companyName}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Assigned Department
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {departmentName}
              </p>
            </div>
          </div>

          {/* Account Status Indicator */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Active Compliance Account
            </span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              Verified SSO
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserMenu;


