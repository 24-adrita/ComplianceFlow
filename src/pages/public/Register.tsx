import React from 'react';
<<<<<<< HEAD
import { ShieldCheck, ArrowLeft, Users, Shield, Layers, Lock } from 'lucide-react';
=======
import { ShieldCheck } from 'lucide-react';
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
import RegisterForm from '../../features/auth/components/RegisterForm';

export interface RegisterPageProps {
  onNavigateLogin: () => void;
  onBackHome: () => void;
  onSuccess?: () => void;
}

export default function RegisterPage({
  onNavigateLogin,
  onBackHome,
  onSuccess,
}: RegisterPageProps) {
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
          {/* Left Side - Brand & Onboarding Features (Desktop) */}
          <div className="lg:col-span-5 hidden lg:block space-y-8 pr-4">
            <div className="space-y-3">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Company Onboarding
              </span>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                Onboard your organization with audit-ready compliance tools.
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Configure your company workspace, organize department structures, assign roles, and centralize license tracking from day one.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Multi-Department Organization</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Map corporate entities, legal branches, and internal department directories seamlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Role-Based Governance</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assign Super Admin, Compliance Officer, and Department Lead access levels with clear isolation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-white">Centralized Executive Visibility</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time compliance scorecards, category distribution analytics, and expiration timelines.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Multi-tenant isolation · Immediate workspace deployment</span>
            </div>
          </div>

          {/* Right Side - Registration Form Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="mb-6 space-y-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  Create an account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register your organization to start managing compliance.
                </p>
              </div>

              <RegisterForm onNavigateLogin={onNavigateLogin} onSuccess={onSuccess} />
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
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] min-h-screen items-center gap-8 px-6 py-12">
        <div className="flex flex-col justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xl font-semibold tracking-tight">ComplianceFlow</span>
              </div>
              <button
                onClick={onBackHome}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                Back to homepage
              </button>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 font-semibold">Company registration</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Create your ComplianceFlow account</h2>
              <p className="text-sm text-slate-600 mt-3">Register your company workspace to centralize compliance operations.</p>
            </div>

            <RegisterForm onNavigateLogin={onNavigateLogin} onSuccess={onSuccess} />
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-12 text-white shadow-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300 font-semibold mb-4">Compliance that scales</p>
            <h3 className="text-3xl font-bold leading-tight mb-4">Onboard your team with secure, audit-ready workflows.</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Configure your organization, define approval paths, and stay ahead of regulatory deadlines from day one.
            </p>
          </div>

          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <span className="mt-1 text-blue-300">•</span>
              <p>Company-wide compliance visibility with centralized reporting.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-blue-300">•</span>
              <p>Secure access controls and audited user activity tracking.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-blue-300">•</span>
              <p>Fast setup for teams, departments, and renewal workflows.</p>
            </div>
          </div>

          <p className="mt-auto text-xs text-slate-500">Built for enterprise compliance teams.</p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
