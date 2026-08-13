import React from 'react';
<<<<<<< HEAD
import AuthLayout from '../components/AuthLayout';
import ResetPasswordForm from '../components/ResetPasswordForm';
=======
import ResetPasswordForm from '../components/ResetPasswordForm';
import { ShieldCheck } from 'lucide-react';
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2

export interface ResetPasswordPageProps {
  prefilledToken?: string;
  onNavigateLogin: () => void;
  onBackHome?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  prefilledToken,
  onNavigateLogin,
<<<<<<< HEAD
}) => {
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter your authorization token and choose a secure new password"
      activeView="reset"
      onNavigateView={() => onNavigateLogin()}
    >
      <ResetPasswordForm
        prefilledToken={prefilledToken}
        onNavigateLogin={onNavigateLogin}
        onSuccess={() => {
          setTimeout(() => {
            onNavigateLogin();
          }, 1500);
        }}
      />
    </AuthLayout>
=======
  onBackHome,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="inline-flex items-center gap-2 mb-8 justify-center">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ComplianceFlow</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">Security Portal</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Reset Password</h1>
            </div>
            {onBackHome && (
              <button
                onClick={onBackHome}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                Homepage
              </button>
            )}
          </div>

          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Please enter your authorization token and set your new password below.
          </p>

          <ResetPasswordForm
            prefilledToken={prefilledToken}
            onNavigateLogin={onNavigateLogin}
            onSuccess={() => {
              setTimeout(() => {
                onNavigateLogin();
              }, 1500);
            }}
          />
        </div>
      </div>
    </div>
>>>>>>> 88d39ffe5a1d263a44646edc6eaf3743884720d2
  );
};

export default ResetPasswordPage;
