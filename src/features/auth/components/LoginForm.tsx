import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onNavigateForgotPassword?: () => void;
  onNavigateRegister?: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onNavigateForgotPassword,
  onNavigateRegister,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      const success = await login(data.email, data.password);
      if (success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Helper for quick demo login fill
  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setErrorMessage(null);
    toast.success(`Prefilled test credentials for ${email}`);
  };

  return (
    <div className="space-y-5">
      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-medium text-rose-800 dark:text-rose-200">Authentication error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.password?.message}
            showPasswordToggle
            {...register('password')}
          />
        </div>

        {/* Remember Me & Forgot Password Link */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 select-none cursor-pointer text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
              {...register('rememberMe')}
            />
            <span>Remember me</span>
          </label>

          {onNavigateForgotPassword && (
            <button
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          className="mt-1 py-2.5"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Demo Credentials Drawer */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Quick demo accounts
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@compliance.com.bd', 'Admin123!')}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-left transition-colors flex flex-col cursor-pointer"
          >
            <span className="font-medium text-slate-800 dark:text-slate-200">Super Admin</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">admin@compliance.com.bd</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('tanvir.ahmed@dhakatech.com.bd', 'Officer123!')}
            className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-left transition-colors flex flex-col cursor-pointer"
          >
            <span className="font-medium text-slate-800 dark:text-slate-200">Compliance Officer</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">tanvir.ahmed@dhakatech.com.bd</span>
          </button>
        </div>
      </div>

      {/* Navigation to Register */}
      {onNavigateRegister && (
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
          Don&apos;t have an account yet?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Register your organization
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
