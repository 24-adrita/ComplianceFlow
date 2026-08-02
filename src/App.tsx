import React, { useState } from 'react';
import AppProviders from './providers/AppProviders';
import { useAuth } from './context/AuthContext';
import Homepage from './pages/public/Homepage';
import LoginPage from './pages/public/Login';
import RegisterPage from './pages/public/Register';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';

function MainAppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<'homepage' | 'login' | 'register' | 'forgot'>('homepage');

  const handleNavigateHome = () => setAuthView('homepage');
  const handleNavigateLogin = () => setAuthView('login');
  const handleNavigateRegister = () => setAuthView('register');
  const handleNavigateForgot = () => setAuthView('forgot');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200 font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Loading ComplianceFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'homepage') {
      return (
        <Homepage onNavigateLogin={handleNavigateLogin} onNavigateRegister={handleNavigateRegister} />
      );
    }

    if (authView === 'login') {
      return (
        <LoginPage
          onNavigateRegister={handleNavigateRegister}
          onNavigateForgotPassword={handleNavigateForgot}
          onBackHome={handleNavigateHome}
          onSuccess={() => setAuthView('homepage')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterPage
          onNavigateLogin={handleNavigateLogin}
          onBackHome={handleNavigateHome}
          onSuccess={() => setAuthView('homepage')}
        />
      );
    }

    if (authView === 'forgot') {
      return (
        <ForgotPasswordPage
          onNavigateLogin={handleNavigateLogin}
          onNavigateResetPassword={() => setAuthView('login')}
          onNavigateView={(view) => {
            if (view === 'login') handleNavigateLogin();
            else if (view === 'register') handleNavigateRegister();
            else if (view === 'forgot') handleNavigateForgot();
          }}
        />
      );
    }

    return null;
  }

  if (isAuthenticated) {
    return (
      <Homepage
        onNavigateLogin={handleNavigateLogin}
        onNavigateRegister={handleNavigateRegister}
        onSignOut={logout}
        isAuthenticated
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-2xl w-full px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">You are logged in successfully.</h1>
        <p className="text-slate-600 mb-6">
          There is no dashboard page enabled after login. Your account is authenticated and ready.
        </p>
        <button
          onClick={handleNavigateHome}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <MainAppContent />
    </AppProviders>
  );
}

