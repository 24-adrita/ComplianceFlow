import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import { NavRoute } from '../components/layout/Sidebar';
import { ApiService } from '../services/api';
import UserProfilePage from './UserProfilePage';
import ChangePasswordPage from './ChangePasswordPage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  ComplianceRecord,
  DashboardMetrics,
  Company,
  User,
  AuditLog,
  NotificationItem,
  DepartmentItem,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatCard } from '../components/common/StatCard';
import { NewRecordModal } from '../components/modals/NewRecordModal';
import toast from 'react-hot-toast';
import {
  FileCheck2,
  Plus,
  RefreshCw,
  Search,
  Bell,
  Calendar as CalendarIcon,
  Building2,
  Users,
  ShieldCheck,
  History,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  Mail,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle,
  Filter,
  User as UserIcon,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function Workspace() {
  const { user, selectedCompanyScope, companies, logout, switchUserRole } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('profile');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      
      const [mRes, nRes] = await Promise.all([
        ApiService.getDashboardMetrics(scope),
        user ? ApiService.getNotifications(user.id) : Promise.resolve({ success: true, notifications: [] }),
      ]);

      if (mRes.success && mRes.metrics) setMetrics(mRes.metrics);
      if (nRes.success && nRes.notifications) setNotifications(nRes.notifications);
    } catch (err) {
      console.error('Workspace load error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const warningCount = metrics ? metrics.warningCount + metrics.expiredCount : 0;

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={setCurrentRoute}
      unreadNotifCount={unreadNotifCount}
      warningCount={warningCount}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Loading Workspace...</p>
        </div>
      ) : (
        <>
          {/* User Profile Page Route */}
          {currentRoute === 'profile' && <UserProfilePage />}

          {/* Change Password Page Route */}
          {currentRoute === 'change_password' && <ChangePasswordPage />}
        </>
      )}
    </AppShell>
  );
}
