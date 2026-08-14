import React, { useState, useEffect } from 'react';
import { ComplianceRecord, ComplianceCategory, RiskLevel, Company, User } from '../../types';
import { Modal } from '../common/Modal';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';
import { UploadCloud, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
    tagsStr: 'Compliance, Permit',
    documentUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

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
        tagsStr: (editingRecord.tags || []).join(', '),
        documentUrl: editingRecord.documentUrl || ''
      });
      if (editingRecord.documentUrl) {
        setUploadedFileName(editingRecord.documentUrl.split('/').pop() || 'attached_document.pdf');
      } else {
        setUploadedFileName('');
      }
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
        tagsStr: 'Compliance, Permit',
        documentUrl: ''
      });
      setUploadedFileName('');
    }
  }, [editingRecord, isOpen, companies, currentUser]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadedFileName(file.name);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        documentUrl: `https://res.cloudinary.com/demo/image/upload/v12345678/${file.name}`
      }));
      setIsUploading(false);
      toast.success(`Attached ${file.name}`);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tags = formData.tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title: formData.title,
        code: formData.code,
        companyId: formData.companyId,
        category: formData.category,
        issuingAuthority: formData.issuingAuthority,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        renewalFrequencyDays: Number(formData.renewalFrequencyDays),
        riskLevel: formData.riskLevel,
        estimatedCost: Number(formData.estimatedCost),
        assignedUserId: formData.assignedUserId,
        notes: formData.notes,
        tags,
        documentUrl: formData.documentUrl
      };

      const defaultUser = currentUser || ({ id: 'usr_admin', name: 'Admin', role: 'ADMIN', email: 'admin@compliance.com', companyId: 'comp_01', companyName: 'Acme', department: 'Compliance', status: 'ACTIVE' } as unknown as User);

      if (editingRecord) {
        await ApiService.updateComplianceRecord(editingRecord.id, payload, defaultUser);
        toast.success('Compliance record updated');
      } else {
        await ApiService.createComplianceRecord(payload, defaultUser);
        toast.success('New compliance record created');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? 'Edit Compliance Record' : 'Create Compliance Record'}
      subtitle="Register permit details, expiration dates, and renewal requirements."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title / License Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trade License Renewal 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Record Code / Reference *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tenant Company *
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category *
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
              Issuing Authority *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dhaka City Corp / NBR"
              value={formData.issuingAuthority}
              onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Risk Level *
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Renewal Cost (BDT)
            </label>
            <input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Trade License, City Corp, Annual"
              value={formData.tagsStr}
              onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Notes & Filing Requirements
          </label>
          <textarea
            rows={2}
            placeholder="Key filing requirements, required documents, or contacts..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Cloudinary Dropzone Proxy */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Document File Attachment (Cloudinary Proxy)
          </label>
          
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/50 transition cursor-pointer relative"
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-1 text-blue-500">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold">Uploading to Cloudinary Proxy...</span>
              </div>
            ) : formData.documentUrl ? (
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{uploadedFileName || 'Document Attached'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData((prev) => ({ ...prev, documentUrl: '' }));
                    setUploadedFileName('');
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1">
                <UploadCloud className="w-6 h-6 text-slate-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drag & drop document here or <span className="text-blue-500 underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400">Supports PDF, PNG, JPG, DOCX up to 25MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {editingRecord ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
