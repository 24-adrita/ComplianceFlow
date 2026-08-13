import React from 'react';
import { ComplianceStatus } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, FileSearch } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold'
  };

  const config: Record<ComplianceStatus, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    compliant: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      label: 'Compliant'
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      label: 'Expiring Soon'
    },
    expired: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
      label: 'Expired'
    },
    renewal_in_progress: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
      label: 'Renewal In Progress'
    },
    pending_review: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-700 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-800',
      icon: <FileSearch className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />,
      label: 'Pending Review'
    }
  };

  const item = config[status] || config.compliant;

  return (
    <span className={`inline-flex items-center rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]}`}>
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
