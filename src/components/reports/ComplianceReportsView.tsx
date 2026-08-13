import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import {
  FileSpreadsheet,
  Download,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplianceRecord } from '../../types';
import {
  exportComplianceSummaryCSV,
  exportExpiredDocumentsCSV,
  exportRenewalHistoryCSV
} from '../../utils/csvExport';
import toast from 'react-hot-toast';

export default function ComplianceReportsView() {
  const { selectedCompanyScope } = useAuth();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const res = await ApiService.getComplianceRecords(scope);
      if (res.success && res.records) {
        setRecords(res.records);
      }
    } catch (err) {
      toast.error('Failed to load records for report analysis');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = records.filter((r) => r.status === 'compliant').length;
  const expiringCount = records.filter((r) => r.status === 'warning').length;
  const expiredCount = records.filter((r) => r.status === 'expired').length;

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Compliance Intelligence & Reports</h1>
            <p className="text-xs text-slate-400">
              Download formal regulatory audit summaries, expired license breakdown, and historical renewal logs.
            </p>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Report 1 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Compliance Summary Report</h3>
            <p className="text-xs text-slate-400">
              Full breakdown of all {records.length} compliance records across all corporate entities.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              exportComplianceSummaryCSV(records);
              toast.success('Downloaded Compliance Summary CSV');
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Summary CSV
          </Button>
        </motion.div>

        {/* Report 2 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Expired Licenses Audit Report</h3>
            <p className="text-xs text-slate-400">
              List of all currently expired or non-compliant licenses requiring urgent renewal.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              exportExpiredDocumentsCSV(records);
              toast.success('Downloaded Expired Documents CSV');
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Expired CSV
          </Button>
        </motion.div>

        {/* Report 3 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Renewal History Logs</h3>
            <p className="text-xs text-slate-400">
              Historical timeline of past renewal cycles, vendor expenses, and completion timestamps.
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={async () => {
              try {
                const res = await ApiService.getRenewalPipeline();
                if (res.success && res.renewals) {
                  exportRenewalHistoryCSV(res.renewals);
                  toast.success('Downloaded Renewal History CSV');
                }
              } catch (err) {
                toast.error('Failed to export renewal history');
              }
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Renewal Logs
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
