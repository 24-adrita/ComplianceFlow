import React from 'react';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateResetPassword: (prefilledToken?: string) => void;
  onNavigateView: (view: 'login' | 'register' | 'forgot' | 'reset') => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateResetPassword,
  onNavigateView,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-black p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Forgot Password</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Reset your account password</h1>
          </div>
          <button
            onClick={onNavigateLogin}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            Back to Login
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Enter your work email and we will send a reset link so you can choose a new password.
        </p>

        <ForgotPasswordForm
          onNavigateLogin={onNavigateLogin}
          onNavigateResetPassword={onNavigateResetPassword}
        />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
