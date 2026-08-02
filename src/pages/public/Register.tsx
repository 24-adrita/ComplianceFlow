import React from 'react';
import { ShieldCheck } from 'lucide-react';
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
