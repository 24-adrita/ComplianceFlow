import React, { useState, useEffect } from 'react';
import { ComplianceRecord, ComplianceCategory, RiskLevel, Company, User } from '../../types';
import { Modal } from '../common/Modal';
import { ApiService } from '../../services/api';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRecord?: ComplianceRecord | null;
  companies: Company[];
  currentUser: User | null;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingRecord,
  companies,
  currentUser
}) => {
  const categories: ComplianceCategory[] = [
    'Corporate & Legal',
    'Tax & Financial',
    'Environmental & Safety',
    'Data Privacy & ISO',
    'HR & Labor',
    'Trade & Export',
    'Healthcare & FDA',
    'Operational License'
  ];

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    companyId: companies[0]?.id || 'comp_01',
    category: 'Corporate & Legal' as ComplianceCategory,
    issuingAuthority: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    renewalFrequencyDays: 365,
    riskLevel: 'medium' as RiskLevel,
    estimatedCost: 5000,
    assignedUserId: currentUser?.id || 'usr_compliance',
    notes: '',
    tagsStr: 'Compliance, Permit'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        title: editingRecord.title,
        code: editingRecord.code,
        companyId: editingRecord.companyId,
        category: editingRecord.category,
        issuingAuthority: editingRecord.issuingAuthority,
        issueDate: editingRecord.issueDate,
        expiryDate: editingRecord.expiryDate,
        renewalFrequencyDays: editingRecord.renewalFrequencyDays,
        riskLevel: editingRecord.riskLevel,
        estimatedCost: editingRecord.estimatedCost,
        assignedUserId: editingRecord.assignedUserId,
        notes: editingRecord.notes || '',
        tagsStr: (editingRecord.tags || []).join(', ')
      });
    } else {
      setFormData({
        title: '',
        code: 'COMP-' + Math.floor(100000 + Math.random() * 900000),
        companyId: companies[0]?.id || 'comp_01',
        category: 'Corporate & Legal',
        issuingAuthority: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        renewalFrequencyDays: 365,
        riskLevel: 'medium',
        estimatedCost: 5000,
        assignedUserId: currentUser?.id || 'usr_compliance',
        notes: '',
        tagsStr: 'Compliance, Permit'
      });
    }
  }, [editingRecord, isOpen, companies, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.title || !formData.code || !formData.expiryDate) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tagsStr.split(',').map((t) => t.trim()).filter(Boolean)
      };

      if (editingRecord) {
        await ApiService.updateComplianceRecord(editingRecord.id, payload, currentUser);
      } else {
        await ApiService.createComplianceRecord(payload, currentUser);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? 'Edit Compliance Record' : 'Create New Compliance Record'}
      subtitle="Register new regulatory license, permit, or certification document"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Compliance Title / License Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., ISO 27001 Certification, FDA Facility Permit"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Code / Reference *
            </label>
            <input
              type="text"
              required
              placeholder="ISO-27001-2025"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Entity Scope *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplianceCategory })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issuing Regulatory Authority
            </label>
            <input
              type="text"
              placeholder="e.g. FDA, ISO BSI, EPA"
              value={formData.issuingAuthority}
              onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expiration Date *
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Risk Level Rating
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Renewal Fee ($ USD)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Audit, Mandatory, FDA"
              value={formData.tagsStr}
              onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Audit Notes & Compliance Requirements
          </label>
          <textarea
            rows={3}
            placeholder="Key filing requirements, required audit attachments, and contact person..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {isSubmitting ? 'Saving Record...' : editingRecord ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
