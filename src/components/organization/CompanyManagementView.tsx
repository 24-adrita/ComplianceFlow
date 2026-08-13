import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import {
  Building2,
  Plus,
  Search,
  Users,
  ShieldCheck,
  Edit2,
  Globe,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Layers,
  RefreshCw
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Company } from '../../types';
import toast from 'react-hot-toast';

export default function CompanyManagementView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    code: '',
    industry: 'Manufacturing & Heavy Industry',
    country: 'Bangladesh',
    registrationNumber: '',
    status: 'active'
  });

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getCompanies();
      if (res.success && res.companies) {
        setCompanies(res.companies);
      }
    } catch (err) {
      toast.error('Failed to load company entities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Company Name and Code are required.');
      return;
    }

    try {
      if (editingCompany) {
        await ApiService.updateCompany(editingCompany.id, formData);
        toast.success('Company updated successfully!');
      } else {
        await ApiService.createCompany(formData);
        toast.success('New company subsidiary registered!');
      }
      setIsModalOpen(false);
      setEditingCompany(null);
      loadCompanies();
    } catch (err: any) {
      toast.error('Failed to save company.');
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Company & Workspace Management</h1>
            <p className="text-xs text-slate-400">
              Manage multi-tenant corporate entities, subsidiaries, registration details, and tenant isolation scopes.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingCompany(null);
            setFormData({
              name: '',
              code: '',
              industry: 'Manufacturing & Heavy Industry',
              country: 'Bangladesh',
              registrationNumber: '',
              status: 'active'
            });
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Subsidiary
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Total Workspace Subsidiaries: <strong className="text-white">{companies.length}</strong>
        </span>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-blue-400 text-sm">
                      {c.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{c.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{c.registrationNumber || 'REG-PENDING'}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {c.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Industry: <strong className="text-slate-200">{c.industry || 'Corporate'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Jurisdiction: <strong className="text-slate-200">{c.country || 'Bangladesh'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Tenant Isolated Scope</span>
                <button
                  onClick={() => {
                    setEditingCompany(c);
                    setFormData(c);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-blue-400" />
                  <span>Edit</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal: Create/Edit Company */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCompany ? 'Edit Subsidiary' : 'Register New Subsidiary'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Subsidiary Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Pharma Industries Ltd."
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Entity Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APEX-PH"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reg Number</label>
                  <input
                    type="text"
                    placeholder="e.g. C-89102/2021"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Pharmaceuticals & Healthcare"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Entity
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
