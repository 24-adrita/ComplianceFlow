import React from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TenantSelector: React.FC = () => {
  const { user } = useAuth();
  const companyName = user?.companyName || 'Dhaka Tech & Enterprise Ltd.';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
      <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
      <span className="max-w-[160px] sm:max-w-[220px] truncate">
        {companyName}
      </span>
      <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
        Organization
      </span>
    </div>
  );
};

export default TenantSelector;



