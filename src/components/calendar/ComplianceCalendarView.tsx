import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Filter,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplianceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import toast from 'react-hot-toast';

export default function ComplianceCalendarView() {
  const { selectedCompanyScope } = useAuth();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRecords, setSelectedDayRecords] = useState<{ dateStr: string; items: ComplianceRecord[] } | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      const res = await ApiService.getComplianceRecords(scope);
      if (res.success && res.records) {
        setRecords(res.records);
      }
    } catch (err: any) {
      toast.error('Failed to load compliance records for calendar');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Calendar Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map expiry dates to records
  const recordsByDateMap = React.useMemo(() => {
    const map: Record<string, ComplianceRecord[]> = {};
    records.forEach((rec) => {
      if (rec.expiryDate) {
        const dateKey = rec.expiryDate; // YYYY-MM-DD
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(rec);
      }
    });
    return map;
  }, [records]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Compliance & Expiry Calendar</h1>
            <p className="text-xs text-slate-400">
              Visual monthly schedule of permit expiration dates, regulatory deadlines, and scheduled renewals.
            </p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToday}
          >
            Today
          </Button>
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-3">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before 1st day */}
          {[...Array(startDayOfWeek)].map((_, idx) => (
            <div key={`empty-${idx}`} className="h-28 bg-slate-950/30 rounded-xl border border-slate-800/40 opacity-30" />
          ))}

          {/* Actual Month Days */}
          {[...Array(daysInMonth)].map((_, idx) => {
            const dayNum = idx + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;

            const dayRecords = recordsByDateMap[dateKey] || [];
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => {
                  if (dayRecords.length > 0) {
                    setSelectedDayRecords({ dateStr: dateKey, items: dayRecords });
                  }
                }}
                className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${
                  isToday
                    ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/40'
                    : dayRecords.length > 0
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-950/50 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-blue-600 text-white font-extrabold'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayRecords.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {dayRecords.length} due
                    </span>
                  )}
                </div>

                {/* Event Indicators */}
                <div className="space-y-1 overflow-y-auto custom-scrollbar max-h-16">
                  {dayRecords.slice(0, 2).map((rec) => {
                    const isExp = new Date(rec.expiryDate).getTime() < Date.now();
                    return (
                      <div
                        key={rec.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                          isExp
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        <span className="truncate">{rec.title}</span>
                      </div>
                    );
                  })}
                  {dayRecords.length > 2 && (
                    <div className="text-[9px] text-slate-400 font-bold px-1">
                      +{dayRecords.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Items Drawer / Modal */}
      {selectedDayRecords && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Permits Expiring on {selectedDayRecords.dateStr}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDayRecords.items.length} records scheduled for expiration on this date.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDayRecords(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedDayRecords.items.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{rec.code}</span>
                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                    <p className="text-[11px] text-slate-400">{rec.issuingAuthority || rec.category}</p>
                  </div>
                  <StatusBadge status={rec.status} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
