import React from 'react';
import { ShieldCheck } from 'lucide-react';
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
