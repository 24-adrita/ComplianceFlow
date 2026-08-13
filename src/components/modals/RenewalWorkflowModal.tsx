import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  DollarSign,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Paperclip,
  Check,
  AlertCircle
} from 'lucide-react';
import { ComplianceRecord, User } from '../../types';
import { ApiService } from '../../services/api';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface RenewalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: ComplianceRecord | null;
  currentUser: User | null;
}

export function RenewalWorkflowModal({
  isOpen,
  onClose,
  onSuccess,
  record,
  currentUser
}: RenewalWorkflowModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  // Step 1: Request
  const [notes, setNotes] = useState<string>('');
  const [targetExpiryDate, setTargetExpiryDate] = useState<string>(() => {
    if (!record) return '';
    const d = new Date(record.expiryDate);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });

  // Step 2: Process
  const [vendorName, setVendorName] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<number>(record?.estimatedCost || 5000);

  // Step 3: Complete
  const [newIssueDate, setNewIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newExpiryDate, setNewExpiryDate] = useState<string>(targetExpiryDate);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>(record?.documentUrl || '');

  if (!isOpen || !record) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      // Create mock preview URL or simulate upload
      const fakeUrl = URL.createObjectURL(file);
      setDocumentUrl(fakeUrl);
      toast.success(`Attached ${file.name} for renewal verification`);
    }
  };

  const handleAdvanceStep = async (nextStep: 2 | 3) => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      if (currentStep === 1) {
        // Step 1 -> Step 2
        await ApiService.advanceRenewalWorkflow(
          record.id,
          'submitted',
          `Renewal Requested. Notes: ${notes}. Target Expiry: ${targetExpiryDate}`,
          currentUser
        );
        toast.success('Renewal Request submitted. Proceeding to Vendor Assignment.');
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Step 2 -> Step 3
        await ApiService.advanceRenewalWorkflow(
          record.id,
          'under_review',
          `Vendor Assigned: ${vendorName || 'In-House'}. Cost: ৳${estimatedCost}`,
          currentUser
        );
        toast.success('Vendor and Cost assigned. Proceeding to Final Completion & Archiving.');
        setCurrentStep(3);
      }
    } catch (err: any) {
      toast.error('Failed to advance renewal workflow step');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRenewal = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      // Complete renewal workflow and update record issue/expiry dates
      await ApiService.advanceRenewalWorkflow(
        record.id,
        'approved',
        `Renewal Completed. New Expiry: ${newExpiryDate}. Archiving previous cycle.`,
        currentUser
      );

      // Update compliance record details
      await ApiService.updateComplianceRecord(
        record.id,
        {
          issueDate: newIssueDate,
          expiryDate: newExpiryDate,
          status: 'compliant',
          documentUrl: documentUrl || record.documentUrl,
          estimatedCost: Number(estimatedCost),
          notes: `${record.notes || ''}\n[Renewed on ${new Date().toLocaleDateString()} by ${currentUser.name}]`,
        },
        currentUser
      );

      toast.success(`License ${record.code} successfully renewed & archived!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to finalize renewal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                3-Step License Renewal Lifecycle
              </h2>
              <p className="text-xs text-slate-400">
                {record.title} <span className="font-mono text-slate-500">({record.code})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifecycle Stepper Timeline Header */}
        <div className="my-6 grid grid-cols-3 gap-2">
          {/* Step 1 Indicator */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
              currentStep === 1
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : currentStep > 1
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
            }`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <div>
              <div className="text-xs font-bold">1. Request</div>
              <div className="text-[10px] text-slate-400">Notes & Dates</div>
            </div>
          </div>

          {/* Step 2 Indicator */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
              currentStep === 2
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : currentStep > 2
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
            }`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <div>
              <div className="text-xs font-bold">2. Process</div>
              <div className="text-[10px] text-slate-400">Vendor & Budget</div>
            </div>
          </div>

          {/* Step 3 Indicator */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
              currentStep === 3
                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
              3
            </div>
            <div>
              <div className="text-xs font-bold">3. Complete</div>
              <div className="text-[10px] text-slate-400">Upload & Archive</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-4 min-h-60">
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Step 1: Initiate Renewal Request
                </span>
                <p className="text-xs text-slate-400">
                  Specify justification notes, current expiry comparison, and targeted expiry date for extended validity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target New Expiry Date</label>
                <input
                  type="date"
                  value={targetExpiryDate}
                  onChange={(e) => setTargetExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Renewal Justification & Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter specific regulatory compliance instructions or notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Step 2: Process Vendor Assignment & Budgeting
                </span>
                <p className="text-xs text-slate-400">
                  Assign external legal consultants, government expeditors, and estimated filing fees.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Vendor / Agency Name</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Dhaka Legal Consultancy & Co."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Cost (BDT / ৳)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Step 3: Final Document Upload & Auto-Archiving
                </span>
                <p className="text-xs text-slate-400">
                  Attach the newly issued official PDF license, confirm effective dates, and archive prior cycle.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Issue Date</label>
                  <input
                    type="date"
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Extended Official License File</label>
                <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/60">
                  <UploadCloud className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">
                    {uploadedFile ? uploadedFile.name : 'Click or drop new license PDF/Image'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">PDF, PNG, JPG up to 10MB</span>
                  <input type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
                </label>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2)}
              disabled={submitting}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAdvanceStep((currentStep + 1) as 2 | 3)}
              isLoading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompleteRenewal}
              isLoading={submitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete & Auto-Archive
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
