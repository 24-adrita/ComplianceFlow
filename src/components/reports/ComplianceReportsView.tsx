import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import {
  FileSpreadsheet,
  Download,
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-xl text-blue-600 dark:text-blue-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Compliance Reports</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export regulatory summaries, expired license breakdown, and renewal audit records
            </p>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Report 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance Summary Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full breakdown of all {records.length} compliance records across corporate entities.
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Export Summary CSV
          </Button>
        </div>

        {/* Report 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl w-fit">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expired Licenses Audit Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              List of all currently expired or non-compliant licenses requiring renewal.
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Export Expired CSV
          </Button>
        </div>

        {/* Report 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 rounded-xl w-fit">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Renewal History Logs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical record of past renewal cycles, dates, and completion timestamps.
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
                } else {
                  exportComplianceSummaryCSV(records);
                  toast.success('Downloaded Summary CSV');
                }
              } catch (err) {
                toast.error('Failed to export renewal history');
              }
            }}
            leftIcon={<Download className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Export Renewal Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
