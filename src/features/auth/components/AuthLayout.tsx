import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
<<<<<<< HEAD
=======
import Card from '../../../components/ui/Card';
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
import ThemeToggle from '../../../components/layout/ThemeToggle';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  activeView: 'login' | 'register' | 'forgot' | 'reset';
  onNavigateView?: (view: 'login' | 'register' | 'forgot' | 'reset') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  activeView,
  onNavigateView,
}) => {
  return (
<<<<<<< HEAD
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 text-slate-100" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white tracking-tight">ComplianceFlow</h1>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
=======
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10 bg-slate-900/90 border border-slate-800">
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">ComplianceFlow</h1>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
                  Enterprise Platform
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
<<<<<<< HEAD
              <h2 className="text-xl font-semibold text-white leading-snug">
                Automated multi-tenant compliance tracking
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Streamline corporate permits, regulatory renewals, approval workflows, and tenant management in a secure, audit-ready environment.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Multi-tenant data isolation with role-based access control.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Automated 30-day expiration alerts & renewal approval workflows.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Centralized document vault & structured renewal pipelines.</span>
=======
              <h2 className="text-2xl font-bold text-white leading-tight">
                Automated Multi-Tenant Compliance & License Tracking
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Streamline corporate permits, regulatory renewals, approval workflows, and audit trails in a secure isolated environment.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multi-tenant data isolation with role-based access control (RBAC).</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated 30-day expiration alerts & renewal approval workflows.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Immutable audit logs & public QR license verification.</span>
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              256-bit SSL Encrypted
=======
          <div className="pt-8 border-t border-slate-800/80 mt-8 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              SOC2 Type II Certified
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
            </span>
            <span>v1.0.0</span>
          </div>
        </div>

<<<<<<< HEAD
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between mb-6">
=======
        <Card variant="default" className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-none border-none">
          <div className="min-h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
              {onNavigateView && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => onNavigateView('login')}
<<<<<<< HEAD
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeView === 'login'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => onNavigateView('register')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeView === 'register'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Register company
=======
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      activeView === 'login'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigateView('register')}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      activeView === 'register'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Register Company
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
                  </button>
                </div>
              )}
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>

<<<<<<< HEAD
            <div className="mb-5 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
=======
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
            </div>

            {children}
          </div>

<<<<<<< HEAD
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
            Need assistance? Contact your corporate compliance administrator.
          </div>
        </div>
=======
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Need compliance assistance? Contact your company administrator or support team.
          </div>
        </Card>
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
      </div>
    </div>
  );
};

export default AuthLayout;
<<<<<<< HEAD

=======
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
