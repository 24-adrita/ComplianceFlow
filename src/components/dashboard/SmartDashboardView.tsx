import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Filter,
  Info,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  DashboardOverviewData,
  DashboardChartsData,
  ComplianceRecord,
  AuditLog
} from '../../types';
import toast from 'react-hot-toast';

// Chart Color Palettes
const CATEGORY_COLORS = [
  '#3B82F6', // Blue - Corporate/Legal
  '#10B981', // Emerald - Tax/Financial
  '#F59E0B', // Amber - EHS/Fire
  '#8B5CF6', // Purple - Data Privacy/ISO
  '#EC4899', // Pink - HR/Labor
  '#06B6D4', // Cyan - Trade/Export
  '#6366F1', // Indigo - Healthcare
  '#64748B'  // Slate - Operational
];

const RISK_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#7C3AED'
};

export default function SmartDashboardView() {
  const { selectedCompanyScope, companies } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [charts, setCharts] = useState<DashboardChartsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const companyScope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const deptScope = selectedDepartment === 'all' ? undefined : selectedDepartment;

      const [overviewRes, chartsRes] = await Promise.all([
        ApiService.getDashboardOverview(companyScope, deptScope),
        ApiService.getDashboardCharts(companyScope, deptScope)
      ]);

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      }
      if (chartsRes.success && chartsRes.data) {
        setCharts(chartsRes.data);
      }

      if (isManualRefresh) {
        toast.success('Dashboard metrics & analytics updated');
      }
    } catch (error: any) {
      console.error('Failed to load dashboard analytics:', error);
      toast.error(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCompanyScope, selectedDepartment]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-20 bg-slate-800/50 rounded-2xl border border-slate-700/50 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-800 lg:col-span-2" />
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const cards = overview?.cards || {
    totalDocuments: 0,
    activeDocuments: 0,
    expiringSoonDocuments: 0,
    expiredDocuments: 0,
    pendingRenewals: 0,
    renewedDocuments: 0
  };

  const health = overview?.healthSummary || {
    score: 100,
    healthRating: 'Excellent',
    activePlusRenewed: 0,
    totalDocuments: 0,
    formula: '(Active + Renewed Documents) / Total Documents * 100'
  };

  const forecast = overview?.expiryForecast || {
    next30Days: 0,
    next60Days: 0,
    next90Days: 0
  };

  const risk = overview?.riskSummary || {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };

  // Color mappings for Health Score
  const healthRatingColors = {
    Excellent: 'from-emerald-500 to-teal-600 text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Good: 'from-blue-500 to-cyan-600 text-blue-400 bg-blue-500/10 border-blue-500/30',
    Fair: 'from-amber-500 to-orange-600 text-amber-400 bg-amber-500/10 border-amber-500/30',
    Critical: 'from-rose-500 to-red-600 text-rose-400 bg-rose-500/10 border-rose-500/30'
  }[health.healthRating || 'Excellent'];

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Top Banner & Context Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display text-white">
                Executive Compliance Dashboard
              </h1>
              <p className="text-xs text-slate-400">
                Real-time monitoring, renewal forecasts, and risk distribution across all enterprise entities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Department Filter Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900 text-white">All Departments</option>
              <option value="Legal, Tax & Regulatory Affairs" className="bg-slate-900 text-white">Legal, Tax & Regulatory</option>
              <option value="Environment, Health & Safety (EHS)" className="bg-slate-900 text-white">EHS & Safety</option>
              <option value="Finance & Accounting" className="bg-slate-900 text-white">Finance & Accounting</option>
              <option value="Human Resources & Payroll" className="bg-slate-900 text-white">HR & Labor</option>
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            isLoading={refreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Sync Live Data
          </Button>
        </div>
      </div>

      {/* Module 6: Dashboard Cards (6 Primary Metric Indicators) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Documents */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Documents</span>
            <div className="p-1.5 bg-slate-800 rounded-lg text-slate-300">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{cards.totalDocuments}</div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>Tracked Records</span>
          </p>
        </motion.div>

        {/* Active Documents */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Active Docs</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{cards.activeDocuments}</div>
          <p className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Fully Compliant</span>
          </p>
        </motion.div>

        {/* Expiring Soon */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold">Expiring Soon</span>
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{cards.expiringSoonDocuments}</div>
          <p className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Within 30 Days</span>
          </p>
        </motion.div>

        {/* Expired Documents */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold">Expired Docs</span>
            <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{cards.expiredDocuments}</div>
          <p className="text-[10px] text-rose-400/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Requires Action</span>
          </p>
        </motion.div>

        {/* Pending Renewals */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-semibold">Pending Renewal</span>
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{cards.pendingRenewals}</div>
          <p className="text-[10px] text-indigo-400/80 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>In Processing</span>
          </p>
        </motion.div>

        {/* Renewed Documents */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/80 border border-teal-500/20 rounded-2xl p-4 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-teal-400 mb-2">
            <span className="text-xs font-semibold">Renewed Docs</span>
            <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400 border border-teal-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{cards.renewedDocuments}</div>
          <p className="text-[10px] text-teal-400/80 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Successfully Extended</span>
          </p>
        </motion.div>
      </div>

      {/* Main Charts & Health Score Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Health Score Widget */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Compliance Health Score</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${healthRatingColors}`}>
                {health.healthRating}
              </span>
            </div>

            {/* Dial Gauge Visual Display */}
            <div className="my-6 flex flex-col items-center justify-center relative">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * health.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-white font-display">{health.score}%</span>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Health Score</p>
                </div>
              </div>
            </div>

            {/* Health Calculation Breakdown */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Active + Renewed:</span>
                <span className="font-bold text-white">{health.activePlusRenewed} Docs</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Managed:</span>
                <span className="font-bold text-white">{health.totalDocuments} Docs</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-400 shrink-0" />
                <span>Formula: {health.formula}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 1: Document Category Distribution */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Document Category Distribution</h3>
                <p className="text-xs text-slate-400">Breakdown of active compliance records by industry & legal regulatory category</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                  >
                    {(charts?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs">
                            <p className="font-bold text-white">{data.category}</p>
                            <p className="text-slate-300 mt-1">Count: <span className="font-bold text-blue-400">{data.count} Docs</span></p>
                            <p className="text-slate-300">Share: <span className="font-bold text-emerald-400">{data.percentage}%</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value) => <span className="text-xs font-semibold text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2 & 3: Department-wise Compliance & Monthly Renewal Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Compliance */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Department-wise Compliance</h3>
              <p className="text-xs text-slate-400">Active vs Expired vs Expiring records per department</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.departmentCompliance || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="departmentName"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
                          <p className="font-bold text-white mb-1.5">{data.departmentName}</p>
                          <div className="space-y-1">
                            <p className="text-emerald-400 font-semibold">Active: {data.active}</p>
                            <p className="text-amber-400 font-semibold">Expiring Soon: {data.expiringSoon}</p>
                            <p className="text-rose-400 font-semibold">Expired: {data.expired}</p>
                            <p className="text-blue-400 font-bold border-t border-slate-800 pt-1">
                              Rate: {data.complianceRate}%
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="active" name="Active" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expiringSoon" name="Expiring Soon" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expired" name="Expired" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Renewal Trend */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Renewal Trend</h3>
              <p className="text-xs text-slate-400">Completed renewals vs pending pipeline throughout the year</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyRenewalTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRenewed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
                          <p className="font-bold text-white mb-1.5">{data.month} Analytics</p>
                          <p className="text-blue-400 font-semibold">Renewed: {data.renewedCount} Docs</p>
                          <p className="text-purple-400 font-semibold">Pending: {data.pendingCount} Docs</p>
                          <p className="text-emerald-400 font-bold border-t border-slate-800 pt-1 mt-1">
                            Est. Cost: ৳{data.totalCost?.toLocaleString()} BDT
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="renewedCount" name="Renewed" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRenewed)" />
                <Area type="monotone" dataKey="pendingCount" name="Pending" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorPending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Widgets Grid: Timeline, Expiry Forecast, Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline Widget */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Renewal Timeline</h3>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                Aug
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">August Target</span>
                <h4 className="text-xs font-bold text-white mt-0.5">Trade License Renewal</h4>
                <p className="text-[10px] text-slate-400">Dhaka City Corporation • Legal Dept</p>
              </div>
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                Sep
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">September Target</span>
                <h4 className="text-xs font-bold text-white mt-0.5">Fire Safety & Clearance License</h4>
                <p className="text-[10px] text-slate-400">Fire Service & Civil Defence Authority</p>
              </div>
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                Oct
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">October Target</span>
                <h4 className="text-xs font-bold text-white mt-0.5">VAT / BIN Registration Return</h4>
                <p className="text-[10px] text-slate-400">National Board of Revenue (NBR)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Forecast Widget */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Expiry Forecast</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Next 30 Days</span>
                  <p className="text-[10px] text-slate-400">Immediate Expiry Horizon</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-extrabold text-sm border border-rose-500/30">
                  {forecast.next30Days} Docs
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Next 60 Days</span>
                  <p className="text-[10px] text-slate-400">Medium Horizon</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-sm border border-amber-500/30">
                  {forecast.next60Days} Docs
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Next 90 Days</span>
                  <p className="text-[10px] text-slate-400">Quarterly Horizon</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-extrabold text-sm border border-blue-500/30">
                  {forecast.next90Days} Docs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Summary Widget */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Risk Summary</h3>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  🟢 Low Risk
                </span>
                <span className="font-extrabold text-white text-xs">{risk.low} Documents</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  🟡 Medium Risk
                </span>
                <span className="font-extrabold text-white text-xs">{risk.medium} Documents</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  🔴 High Risk
                </span>
                <span className="font-extrabold text-white text-xs">{risk.high} Documents</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  🟣 Critical Risk
                </span>
                <span className="font-extrabold text-white text-xs">{risk.critical} Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Risk Documents & Recent Activities Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Risk Documents */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white">High-Risk Compliance Records</h3>
            </div>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              Action Required
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {overview?.highRiskDocuments && overview.highRiskDocuments.length > 0 ? (
              overview.highRiskDocuments.map((doc: ComplianceRecord) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="font-mono text-slate-300">{doc.code}</span>
                      <span>•</span>
                      <span>{doc.issuingAuthority}</span>
                      <span>•</span>
                      <span className="text-rose-400">Expires: {doc.expiryDate}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    {doc.riskLevel || 'High'} Risk
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No critical high-risk records detected currently.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Recent Audit Activities</h3>
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {overview?.recentActivities && overview.recentActivities.length > 0 ? (
              overview.recentActivities.map((log: AuditLog) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded-md shrink-0">
                    {log.userName}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No recent system audit activities recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
