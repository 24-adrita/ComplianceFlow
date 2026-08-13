import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplianceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RenewalWorkflowModal } from '../modals/RenewalWorkflowModal';
import toast from 'react-hot-toast';

export default function RenewalWorkflowView() {
  const { user, selectedCompanyScope } = useAuth();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  
  // Modal state
  const [selectedRecordForRenewal, setSelectedRecordForRenewal] = useState<ComplianceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRenewalRecords = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const res = await ApiService.getComplianceRecords(scope);
      if (res.success && res.records) {
        setRecords(res.records);
      }
    } catch (err: any) {
      toast.error('Failed to load renewal records');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    loadRenewalRecords();
  }, [loadRenewalRecords]);

  // Filter records needing attention or in workflow
  const renewalStages = [
    { id: 'all', label: 'All Records', count: records.length },
    {
      id: 'expired',
      label: 'Expired / Urgent',
      count: records.filter((r) => r.status === 'expired' || new Date(r.expiryDate).getTime() < Date.now()).length,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'expiring',
      label: 'Expiring Soon (<30d)',
      count: records.filter((r) => r.status === 'warning' || (new Date(r.expiryDate).getTime() - Date.now() < 30 * 86400000 && new Date(r.expiryDate).getTime() > Date.now())).length,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'in_progress',
      label: 'In Workflow',
      count: records.filter((r) => r.renewalStep && r.renewalStep !== 'not_started' && r.renewalStep !== 'completed').length,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'compliant',
      label: 'Renewed & Active',
      count: records.filter((r) => r.status === 'compliant').length,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStage === 'expired') {
      return r.status === 'expired' || new Date(r.expiryDate).getTime() < Date.now();
    }
    if (selectedStage === 'expiring') {
      const daysLeft = Math.ceil((new Date(r.expiryDate).getTime() - Date.now()) / 86400000);
      return daysLeft > 0 && daysLeft <= 30;
    }
    if (selectedStage === 'in_progress') {
      return r.renewalStep && r.renewalStep !== 'not_started' && r.renewalStep !== 'completed';
    }
    if (selectedStage === 'compliant') {
      return r.status === 'compliant';
    }

    return true;
  });

  const handleStartRenewal = (rec: ComplianceRecord) => {
    setSelectedRecordForRenewal(rec);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Renewal Management Lifecycle</h1>
            <p className="text-xs text-slate-400">
              Track 3-step renewal workflows, vendor assignment, target dates, and automated document archiving.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadRenewalRecords}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Pipeline
        </Button>
      </div>

      {/* Pipeline Stage Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {renewalStages.map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStage(st.id)}
            className={`p-3.5 rounded-2xl border transition text-left cursor-pointer ${
              selectedStage === st.id
                ? 'bg-slate-800 border-blue-500 shadow-lg'
                : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
            }`}
          >
            <div className="text-xs font-semibold text-slate-400 mb-1">{st.label}</div>
            <div className="text-xl font-black text-white flex items-center justify-between">
              <span>{st.count}</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, title, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-white">{filteredRecords.length}</strong> of {records.length} records
        </span>
      </div>

      {/* Renewal Cards Pipeline */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Renewal Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All compliance permits are either active or no records matched your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((rec) => {
            const isExpired = new Date(rec.expiryDate).getTime() < Date.now();
            const daysLeft = Math.ceil((new Date(rec.expiryDate).getTime() - Date.now()) / 86400000);

            return (
              <motion.div
                key={rec.id}
                whileHover={{ y: -2 }}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-400 font-bold">{rec.code}</span>
                    <StatusBadge status={rec.status} />
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2">{rec.title}</h3>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{rec.issuingAuthority || rec.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Expiry:{' '}
                        <strong className={isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {rec.expiryDate}
                        </strong>{' '}
                        <span className="text-[10px] text-slate-500">
                          ({isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Stage: <span className="text-slate-300">{rec.renewalStep || 'Not Started'}</span>
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartRenewal(rec)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Renew License
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3-Step Renewal Workflow Modal */}
      <RenewalWorkflowModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecordForRenewal(null);
        }}
        onSuccess={() => {
          loadRenewalRecords();
        }}
        record={selectedRecordForRenewal}
        currentUser={user}
      />
    </div>
  );
}
