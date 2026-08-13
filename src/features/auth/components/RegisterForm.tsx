import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Building2, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import apiClient from '../../../lib/api-client';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Work email is required')
      .email('Please enter a valid work email address'),
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters'),
    companyCode: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service to proceed',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onNavigateLogin?: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateLogin, onSuccess }) => {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      companyCode: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const currentPassword = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);
      
      // Format Bangladesh phone number
      let formattedPhone = data.phoneNumber ? data.phoneNumber.trim() : undefined;
      if (formattedPhone) {
        if (formattedPhone.startsWith('+880')) {
          // already has +880
        } else if (formattedPhone.startsWith('880')) {
          formattedPhone = '+' + formattedPhone;
        } else {
          // trim leading zeros e.g. 01712345678 -> +8801712345678
          const cleaned = formattedPhone.replace(/^0+/, '');
          formattedPhone = `+880${cleaned}`;
        }
      }

      // Submit registration payload
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'ADMIN',
        phoneNumber: formattedPhone,
        companyName: data.companyName,
        companyCode: data.companyCode || undefined,
      };

      const res: any = await apiClient.post('/auth/register', payload);

      if (res && (res.status === 201 || res.data)) {
        // Log in as the newly created user profile immediately
        await login(data.email, data.password);
        toast.success(`Account registered! Welcome, ${data.name}.`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-medium text-rose-800 dark:text-rose-200">Registration error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name & Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div>
            <Input
              label="Work Email"
              type="email"
              placeholder="jane@company.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </div>

        {/* Company Name & Registration Code / Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Company Name"
              placeholder="Acme Enterprises"
              leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              error={errors.companyName?.message}
              {...register('companyName')}
            />
          </div>
          <div>
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Phone Number (Bangladesh)
              </label>
              <div className="relative flex items-center">
                <div className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg text-slate-800 dark:text-slate-200 text-xs font-bold gap-1.5 shrink-0 select-none">
                  <span role="img" aria-label="Bangladesh flag">🇧🇩</span>
                  <span>+880</span>
                </div>
                <input
                  type="tel"
                  placeholder="1712-345678"
                  className="w-full rounded-r-lg text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 focus:outline-none focus:ring-2 focus:border-slate-900 dark:focus:border-slate-400 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 transition-colors"
                  {...register('phoneNumber')}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Format: 1XXXXXXXXX or 01XXXXXXXXX (BD mobile)
              </p>
              {errors.phoneNumber?.message && (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.password?.message}
              showPasswordToggle
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.confirmPassword?.message}
              showPasswordToggle
              {...register('confirmPassword')}
            />
          </div>

          {/* Live Password Strength Indicator */}
          <PasswordStrengthIndicator password={currentPassword} />
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 select-none cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              {...register('agreeTerms')}
            />
            <span>
              I agree to the <span className="font-medium text-blue-600 dark:text-blue-400">Terms of Service</span> and <span className="font-medium text-blue-600 dark:text-blue-400">Privacy Policy</span>.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          className="mt-2 py-2.5"
        >
          {isSubmitting ? 'Creating workspace...' : 'Create Company Workspace'}
        </Button>
      </form>

      {/* Already registered link */}
      {onNavigateLogin && (
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
