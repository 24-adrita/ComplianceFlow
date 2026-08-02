import React from 'react';
import {
  ShieldCheck,
  CalendarClock,
  QrCode,
  FileText,
  CheckCircle2,
  ArrowRight,
  Building2,
  Lock,
} from 'lucide-react';

export interface HomepageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
}

export default function Homepage({
  onNavigateLogin,
  onNavigateRegister,
  onSignOut,
  isAuthenticated = false,
}: HomepageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Compliance<span className="text-blue-600">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
            <>
              <button
                onClick={onNavigateLogin}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateRegister}
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm hover:shadow"
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={onSignOut}
              className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg transition shadow-sm hover:shadow"
            >
              Sign Out
            </button>
          )}
          </div>
        </div>
      </nav>

      <section className="py-20 px-6 max-w-7xl mx-auto text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5" /> Enterprise Compliance Management
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Automate renewals & streamline corporate compliance.
          </h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Eliminate compliance risks with automated expiry tracking, multi-tenant RBAC, instant QR verification, and smart renewal workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={onNavigateRegister}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-6 py-3 rounded-lg transition"
            >
              Explore Features
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
            <span className="font-semibold text-slate-800">Compliance Health Index</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">98.4% Compliant</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Trade License Renewal</p>
                  <p className="text-xs text-slate-500">Expires in 28 days</p>
                </div>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">Expiring Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">ISO 27001 Audit</p>
                  <p className="text-xs text-slate-500">Verified & Active</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Audit-Ready Organizations</h2>
            <p className="text-slate-600">Everything you need to secure compliance documents and maintain regulatory standards.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <CalendarClock className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Automated Expiry Alerts</h3>
              <p className="text-slate-600 text-sm">Receive email and in-app notifications before documents expire.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <QrCode className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant QR Verification</h3>
              <p className="text-slate-600 text-sm">Public-facing verification endpoints to instantly validate authentic documents.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <Lock className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant RBAC</h3>
              <p className="text-slate-600 text-sm">Role-based controls for Super Admins, Officers, Auditors, and Employees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300 font-semibold">Trusted by enterprise teams</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Secure compliance operations for complex corporations.</h2>
            <p className="text-slate-300 max-w-xl">
              ComplianceFlow helps enterprise teams reduce risk, stay audit-ready, and keep every renewal on track across multiple business units.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-800/90 p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-300 font-semibold">Compliance score</p>
                <p className="text-2xl font-bold">98.4%</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>99.2% uptime for dashboard access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Enterprise-grade security controls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dedicated audit trail reporting</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-blue-600 p-8 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-100 font-semibold mb-4">Ready to get started?</p>
            <button
              onClick={onNavigateRegister}
              className="w-full bg-white text-blue-700 font-semibold py-3 rounded-xl shadow-lg hover:bg-slate-100 transition"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
