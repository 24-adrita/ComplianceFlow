import React from 'react';
<<<<<<< HEAD
import { ShieldCheck, ArrowLeft, FileCheck, CalendarClock, Building2, Lock } from 'lucide-react';
=======
import { ShieldCheck } from 'lucide-react';
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
import LoginForm from '../../features/auth/components/LoginForm';

export interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onBackHome: () => void;
  onSuccess?: () => void;
}

export default function LoginPage({
  onNavigateRegister,
  onNavigateForgotPassword,
  onBackHome,
  onSuccess,
}: LoginPageProps) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            ComplianceFlow
          </span>
        </div>
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to homepage</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side - Brand & Features (Desktop) */}
          <div className="lg:col-span-6 hidden lg:block space-y-8 pr-4">
            <div className="space-y-3">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Enterprise Compliance Platform
              </span>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                Centralized permit & license management for modern organizations.
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Streamline corporate permits, regulatory renewals, approval workflows, and tenant management in a secure, audit-ready environment.
              </p>
            </div>

            {/* Structured Feature Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Structured Document Vault</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Centralize corporate permits, trade licenses, and tax certificates with validity tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Guided Renewal Lifecycle</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track renewal pipelines, cost estimates, vendor assignments, and historic cycles effortlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Role-Based Access Control</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Granular permissions for Super Admins, Officers, Department Leads, and External Auditors.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Multi-tenant data isolation · 256-bit SSL encryption</span>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="mb-6 space-y-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  Sign in
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your corporate credentials to access your workspace.
                </p>
              </div>

              <LoginForm
                onNavigateRegister={onNavigateRegister}
                onNavigateForgotPassword={onNavigateForgotPassword}
                onSuccess={onSuccess}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-2 text-center text-xs text-slate-400 dark:text-slate-600">
        © 2026 ComplianceFlow Enterprise Platform. All rights reserved.
      </footer>
    </div>
  );
}

=======
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 min-h-screen items-center gap-8 px-6 py-12">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 mb-10">
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ComplianceFlow</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">Partner login</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Welcome back</h2>
              </div>
              <button
                onClick={onBackHome}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                Back to homepage
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Sign in with your corporate credentials to access your ComplianceFlow workspace.
            </p>

            <LoginForm
              onNavigateRegister={onNavigateRegister}
              onNavigateForgotPassword={onNavigateForgotPassword}
              onSuccess={onSuccess}
            />
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-12 text-white shadow-xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300 font-semibold mb-4">Enterprise compliance</p>
            <h3 className="text-3xl font-bold leading-tight mb-4">Modern compliance management designed for high-growth businesses.</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Streamline renewals, maintain audit readiness, and keep teams aligned with a secure compliance platform.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <span className="mt-1 text-blue-300">•</span>
              <p>Automated renewal reminders and compliance task tracking.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-blue-300">•</span>
              <p>Role-based controls for Super Admins, Officers, and Auditors.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-blue-300">•</span>
              <p>Secure audit trails and public verification for documents.</p>
            </div>
          </div>

          <p className="mt-auto text-xs text-slate-500">© 2026 ComplianceFlow</p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
