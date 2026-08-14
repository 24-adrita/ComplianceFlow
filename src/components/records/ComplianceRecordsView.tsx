import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import {
  Search,
  Filter,
  Plus,
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UploadCloud,
  FileText,
  Building2,
  Tag,
  Eye,
  X,
  Paperclip,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { ComplianceRecord, ComplianceCategory, RiskLevel, ComplianceStatus } from '../../types';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, Permissions } from '../../lib/permissions';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { NewRecordModal } from '../modals/NewRecordModal';
import { RenewalWorkflowModal } from '../modals/RenewalWorkflowModal';
import toast from 'react-hot-toast';

export default function ComplianceRecordsView() {
  const { user, selectedCompanyScope, companies } = useAuth();

  const canCreateRecord = hasPermission(user, Permissions.CREATE_RECORDS);
  const canEditRecord = hasPermission(user, Permissions.EDIT_RECORDS);
  const canDeleteRecord = hasPermission(user, Permissions.DELETE_RECORDS);
  const canAdvanceRenewal = hasPermission(user, Permissions.APPROVE_RENEWALS);

  // Data states
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ComplianceRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<ComplianceRecord | null>(null);
  const [renewingRecord, setRenewingRecord] = useState<ComplianceRecord | null>(null);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);

  // Fetch Data
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const res = await ApiService.getComplianceRecords(scope);
      if (res.success && res.records) {
        setRecords(res.records);
      }
    } catch (err: any) {
      console.error('Failed to load compliance records:', err);
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(q);
        const matchesCode = rec.code.toLowerCase().includes(q);
        const matchesAuthority = rec.issuingAuthority.toLowerCase().includes(q);
        const matchesTags = (rec.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCode && !matchesAuthority && !matchesTags) return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && rec.category !== categoryFilter) {
        return false;
      }

      // Department Filter
      if (departmentFilter !== 'all') {
        // Map categories or department matching
        const catMap: Record<string, string[]> = {
          'Legal, Tax & Regulatory Affairs': ['Corporate & Legal', 'Tax & Financial', 'Data Privacy & ISO', 'Trade & Export'],
          'Environment, Health & Safety (EHS)': ['Environmental & Safety', 'Healthcare & FDA'],
          'Finance & Accounting': ['Tax & Financial', 'Operational License'],
          'Human Resources & Payroll': ['HR & Labor']
        };
        const allowedCats = catMap[departmentFilter] || [];
        if (allowedCats.length > 0 && !allowedCats.includes(rec.category)) {
          return false;
        }
      }

      // Priority / Risk Level Filter
      if (riskFilter !== 'all' && rec.riskLevel !== riskFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        const nowMs = Date.now();
        const expMs = new Date(rec.expiryDate).getTime();
        const daysLeft = Math.ceil((expMs - nowMs) / 86400000);

        if (statusFilter === 'active') {
          if (rec.status !== 'compliant' && daysLeft < 30) return false;
        } else if (statusFilter === 'expiring_soon') {
          if (rec.status !== 'warning' && (daysLeft < 0 || daysLeft >= 30)) return false;
        } else if (statusFilter === 'expired') {
          if (rec.status !== 'expired' && daysLeft >= 0) return false;
        } else if (statusFilter === 'renewed') {
          if ((rec.status as string) !== 'renewed' && !(rec.notes && rec.notes.includes('[Renewed on'))) return false;
        }
      }

      return true;
    });
  }, [records, searchQuery, categoryFilter, departmentFilter, riskFilter, statusFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, departmentFilter, riskFilter, statusFilter, itemsPerPage]);

  // Pagination Slice
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this compliance record?')) {
      try {
        await ApiService.deleteComplianceRecord(id, user);
        toast.success('Record deleted successfully');
        loadRecords();
      } catch (err: any) {
        toast.error('Failed to delete record');
      }
    }
  };

  const handleStartRenewal = (record: ComplianceRecord) => {
    setRenewingRecord(record);
    setIsRenewalModalOpen(true);
  };

  // Stat Counters
  const totalCount = records.length;
  const activeCount = records.filter((r) => {
    const days = Math.ceil((new Date(r.expiryDate).getTime() - Date.now()) / 86400000);
    return days >= 30 && r.status !== 'expired';
  }).length;
  const expiringSoonCount = records.filter((r) => {
    const days = Math.ceil((new Date(r.expiryDate).getTime() - Date.now()) / 86400000);
    return days >= 0 && days < 30;
  }).length;
  const expiredCount = records.filter((r) => {
    const days = Math.ceil((new Date(r.expiryDate).getTime() - Date.now()) / 86400000);
    return days < 0 || r.status === 'expired';
  }).length;

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display text-white">
                Compliance Document Management
              </h1>
              <p className="text-xs text-slate-400">
                Centralized registry for corporate licenses, permits, tax filings, and regulatory records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canCreateRecord && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingRecord(null);
                setIsNewModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Compliance Record
            </Button>
          )}
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Managed</span>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <span className="text-[10px] text-slate-500">Official Licenses & Permits</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl text-slate-300">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-medium">Active & Valid</span>
            <div className="text-2xl font-black text-white mt-1">{activeCount}</div>
            <span className="text-[10px] text-emerald-400/70">100% Compliant</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 font-medium">Expiring Soon</span>
            <div className="text-2xl font-black text-white mt-1">{expiringSoonCount}</div>
            <span className="text-[10px] text-amber-400/70">Action Required &lt;30d</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 font-medium">Expired Documents</span>
            <div className="text-2xl font-black text-white mt-1">{expiredCount}</div>
            <span className="text-[10px] text-rose-400/70">Lapsed / Non-Compliant</span>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Dropdowns */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by license title, reference code, issuing authority, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Refresh */}
          <Button
            variant="secondary"
            size="sm"
            onClick={loadRecords}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            title="Refresh record table"
          >
            Refresh
          </Button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Corporate & Legal">Corporate & Legal</option>
              <option value="Tax & Financial">Tax & Financial</option>
              <option value="Environmental & Safety">Environmental & Safety</option>
              <option value="Data Privacy & ISO">Data Privacy & ISO</option>
              <option value="HR & Labor">HR & Labor</option>
              <option value="Trade & Export">Trade & Export</option>
              <option value="Healthcare & FDA">Healthcare & FDA</option>
              <option value="Operational License">Operational License</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Legal, Tax & Regulatory Affairs">Legal & Regulatory</option>
              <option value="Environment, Health & Safety (EHS)">EHS & Safety</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
              <option value="Human Resources & Payroll">HR & Labor</option>
            </select>
          </div>

          {/* Priority / Risk Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Risk Priority
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Validity Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="renewed">Renewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Digital Records Table Card */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Digital Record Vault</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
              {filteredRecords.length} Documents
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">{selectedIds.length} selected</span>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} selected records?`)) {
                    selectedIds.forEach((id) => handleDelete(id));
                    setSelectedIds([]);
                  }
                }}
                className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition"
              >
                Bulk Delete
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
              <tr>
                <th className="p-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={paginatedRecords.length > 0 && selectedIds.length === paginatedRecords.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3">Document Title & Code</th>
                <th className="p-3">Company & Category</th>
                <th className="p-3">Issuing Authority</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-center">Attachment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Fetching compliance records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No compliance records match the specified filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const companyObj = companies.find((c) => c.id === rec.companyId);
                  const isSelected = selectedIds.includes(rec.id);
                  const daysLeft = Math.ceil((new Date(rec.expiryDate).getTime() - Date.now()) / 86400000);

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-blue-500/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(rec.id)}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Title & Code */}
                      <td className="p-3">
                        <div className="font-bold text-white hover:text-blue-400 cursor-pointer" onClick={() => setViewingRecord(rec)}>
                          {rec.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                          <span>{rec.code}</span>
                          {rec.tags && rec.tags.length > 0 && (
                            <span className="text-slate-500">• {rec.tags.join(', ')}</span>
                          )}
                        </div>
                      </td>

                      {/* Company & Category */}
                      <td className="p-3">
                        <div className="text-slate-200 font-medium">{companyObj?.name || 'Group Enterprise'}</div>
                        <div className="text-[10px] text-slate-400">{rec.category}</div>
                      </td>

                      {/* Authority */}
                      <td className="p-3 text-slate-300 font-medium">
                        {rec.issuingAuthority || 'N/A'}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{rec.expiryDate}</div>
                        <div className={`text-[10px] font-semibold ${daysLeft < 0 ? 'text-rose-400' : daysLeft < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3">
                        <StatusBadge status={rec.status} />
                      </td>

                      {/* Risk Badge */}
                      <td className="p-3">
                        <RiskBadge level={rec.riskLevel} />
                      </td>

                      {/* Attachment Link */}
                      <td className="p-3 text-center">
                        {rec.documentUrl ? (
                          <a
                            href={rec.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold hover:bg-blue-500/20 transition"
                            title="Download/View Document"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>PDF</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[10px] italic">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRecord(rec)}
                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                            title="View Record Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEditRecord && (
                            <button
                              onClick={() => {
                                setEditingRecord(rec);
                                setIsNewModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition"
                              title="Edit Record"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canAdvanceRenewal && (
                            <button
                              onClick={() => handleStartRenewal(rec)}
                              className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition"
                              title="Initiate Renewal Workflow"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDeleteRecord && (
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="p-1.5 hover:bg-rose-500/20 rounded text-slate-400 hover:text-rose-400 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing <span className="font-bold text-white">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-bold text-white">{totalItems}</span> records
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-white bg-slate-800 rounded">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New / Edit Document Modal */}
      <NewRecordModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={() => {
          toast.success(editingRecord ? 'Record updated successfully' : 'New record registered');
          loadRecords();
        }}
        editingRecord={editingRecord}
        companies={companies}
        currentUser={user}
      />

      {/* 3-Step Renewal Workflow Modal */}
      <RenewalWorkflowModal
        isOpen={isRenewalModalOpen}
        onClose={() => {
          setIsRenewalModalOpen(false);
          setRenewingRecord(null);
        }}
        onSuccess={() => {
          loadRecords();
        }}
        record={renewingRecord}
        currentUser={user}
      />

      {/* View Record Details Drawer Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setViewingRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">{viewingRecord.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl text-xs space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reference Code</span>
                <span className="font-mono text-white font-bold">{viewingRecord.code}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="text-white font-semibold">{viewingRecord.category}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Issuing Authority</span>
                <span className="text-white">{viewingRecord.issuingAuthority}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                <span className="text-rose-400 font-bold">{viewingRecord.expiryDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost</span>
                <span className="text-emerald-400 font-bold">৳{viewingRecord.estimatedCost?.toLocaleString()} BDT</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Level</span>
                <RiskBadge level={viewingRecord.riskLevel} />
              </div>
            </div>

            {viewingRecord.notes && (
              <div className="bg-slate-950 p-3 rounded-xl text-xs text-slate-300">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Notes & Filing Specs</span>
                {viewingRecord.notes}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingRecord(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
