import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordStrengthIndicator from '../auth/components/PasswordStrengthIndicator';
import apiClient from '../../lib/api-client';
import toast from 'react-hot-toast';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordView: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword', '');

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setErrorMessage(null);
      await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Password changed successfully! Next login will require your new password.');
      reset();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password. Please verify current password.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Change Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your corporate account password to maintain SOC-2 & ISO security readiness.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-semibold">Security Validation Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            themeVariant="light"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.currentPassword?.message}
            showPasswordToggle
            {...register('currentPassword')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            themeVariant="light"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.newPassword?.message}
            showPasswordToggle
            {...register('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            themeVariant="light"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.confirmPassword?.message}
            showPasswordToggle
            {...register('confirmPassword')}
          />
        </div>

        {/* Password Strength Meter */}
        <PasswordStrengthIndicator password={newPasswordValue} />

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ShieldCheck className="w-4 h-4" /> : undefined}
          >
            {isSubmitting ? 'Updating Security Credentials...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordView;
