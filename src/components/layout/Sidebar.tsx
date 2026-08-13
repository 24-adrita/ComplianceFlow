import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
<<<<<<< HEAD
=======
import { useAuth } from '../../context/AuthContext';
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
import {
  LayoutDashboard,
  FileCheck2,
  RefreshCw,
  Calendar,
  Building2,
  Users,
  FileSpreadsheet,
  History,
  Bell,
  QrCode,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronDown,
  UserCheck,
  LogOut,
  Sparkles,
  SlidersHorizontal,
  Circle,
  HelpCircle,
  User,
  Lock,
} from 'lucide-react';

export type NavRoute =
  | 'dashboard'
  | 'records'
  | 'renewals'
  | 'calendar'
  | 'companies'
  | 'departments'
  | 'users'
  | 'reports'
  | 'audit'
  | 'notifications'
  | 'qr_verify'
  | 'search'
  | 'profile'
  | 'change_password';

export interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  warningCount?: number;
  unreadCount?: number;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
}

interface NavItem {
  id: NavRoute;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeVariant?: 'rose' | 'amber' | 'blue' | 'emerald';
  subItems?: { id: NavRoute; label: string }[];
}

interface NavSection {
  title: string;
  id: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  warningCount = 0,
  unreadCount = 0,
<<<<<<< HEAD
  user = {
    name: 'Alexander Wright',
    email: 'a.wright@complianceflow.io',
    role: 'Global Admin',
    avatar: undefined,
  },
}) => {
=======
  user: userProp,
}) => {
  const { user: authUser, currentUser } = useAuth();
  const activeUser = userProp || authUser || currentUser;

>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
  // Track open nested sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    org: true,
    intel: true,
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections: NavSection[] = [
    {
<<<<<<< HEAD
      title: 'Core Platform',
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Smart Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'records',
          label: 'Compliance Records',
          icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
          badge: warningCount > 0 ? warningCount : undefined,
          badgeVariant: 'rose',
        },
        {
          id: 'renewals',
          label: 'Renewal Workflow',
          icon: <RefreshCw className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'calendar',
          label: 'Compliance Calendar',
          icon: <Calendar className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Organization & Users',
      id: 'org',
      items: [
        {
          id: 'companies',
          label: 'Companies',
          icon: <Building2 className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'departments',
          label: 'Departments',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'users',
          label: 'User Management',
          icon: <UserCheck className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Notifications & Alerts',
      id: 'intel',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="w-4 h-4 shrink-0" />,
          badge: unreadCount > 0 ? unreadCount : undefined,
          badgeVariant: 'amber',
        },
      ],
    },
    {
=======
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
      title: 'Account & Security',
      id: 'account',
      items: [
        {
          id: 'profile',
          label: 'User Profile',
          icon: <User className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'change_password',
          label: 'Change Password',
          icon: <Lock className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      aria-label="Sidebar navigation"
      className="h-screen bg-slate-900 text-slate-200 border-r border-slate-800/80 flex flex-col relative z-40 select-none shadow-xl overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0 bg-slate-900/95">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo emblem */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-white shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-slate-100" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-extrabold text-white tracking-tight font-display">
                    ComplianceFlow
                  </h2>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  Enterprise Regulatory Suite
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all hidden lg:flex items-center justify-center shrink-0 border border-transparent hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180 text-blue-400' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Quick Search Shortcut Trigger */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <button
            type="button"
            onClick={() => onNavigate('search')}
            aria-label="Quick search compliance records"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" aria-hidden="true" />
              <span>Search records...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-900 border border-slate-700 text-slate-300 rounded shadow-2xs">
<<<<<<< HEAD
              Ctrl + K
=======
              ⌘K
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
            </kbd>
          </button>
        </div>
      )}

      {/* Main Navigation Items */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto py-3 px-3 space-y-5 custom-scrollbar">
        {sections.map((sec) => {
          const isOpen = openSections[sec.id] !== false;

          return (
            <div key={sec.id} className="space-y-1">
              {/* Section Title Header */}
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  aria-expanded={isOpen}
                  className="w-full px-2 py-1 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-200 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <span>{sec.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-0' : 'transform -rotate-90'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <div className="h-px bg-slate-800/60 my-2" />
              )}

              {/* Items List */}
              {(isOpen || isCollapsed) && (
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const isActive = currentRoute === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                          isActive
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-2xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        {/* Active Indicator Bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r" />
                        )}

                        {/* Icon */}
                        <span
                          className={`transition-colors shrink-0 ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        >
                          {item.icon}
                        </span>

                        {/* Label */}
                        {!isCollapsed && (
                          <span className="truncate flex-1 text-left tracking-tight">
                            {item.label}
                          </span>
                        )}

                        {/* Badge */}
                        {!isCollapsed && item.badge !== undefined && (
                          <span
                            className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 shadow-2xs ${
                              item.badgeVariant === 'rose'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                : item.badgeVariant === 'amber'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Badge Dot Indicator */}
                        {isCollapsed && item.badge !== undefined && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Card Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : 'bg-slate-900/80 border border-slate-800/80'
          }`}
        >
          {/* Avatar with Status Badge */}
          <div className="relative shrink-0">
<<<<<<< HEAD
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600/60 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                user.name?.charAt(0) || 'A'
              )}
=======
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              <User className="w-4 h-4 text-slate-200" />
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>

          {/* User Details & Role Badge */}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
<<<<<<< HEAD
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase shrink-0">
                  {user.role || 'Admin'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* System Status Line */}
        {!isCollapsed && (
          <div className="mt-2.5 px-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500 animate-pulse" />
              <span>API v1.0 • Connected</span>
            </span>
            <span className="font-mono text-slate-400">SOC-2</span>
          </div>
        )}
=======
                <h4 className="text-xs font-bold text-white truncate">{activeUser?.name || 'User'}</h4>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase shrink-0">
                  {activeUser?.role ? activeUser.role.replace('_', ' ') : 'User'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{activeUser?.email || ''}</p>
            </div>
          )}
        </div>
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
      </div>
    </motion.aside>
  );
};

export default Sidebar;


