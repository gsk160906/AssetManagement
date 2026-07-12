import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ROUTES } from '../../constants/routes';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple validation bypass for demo
    if (data.email && data.password) {
      localStorage.setItem('token', 'mock-jwt-session-token');
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: 'ADMIN', name: 'John Doe' }));
      navigate(ROUTES.DASHBOARD);
    } else {
      setErrorMsg('Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleDemoFill = () => {
    setValue('email', 'admin@assetflow.com');
    setValue('password', 'password123');
  };

  return (
    <Card className="w-full max-w-md border border-base-300 shadow-xl bg-base-100/90 backdrop-blur-md">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/25 mb-3">
          A
        </div>
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Welcome to AssetFlow</h2>
        <p className="text-sm text-base-content/60 mt-1">Enterprise Asset & Resource Management</p>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-sm py-2 px-3 mb-4 rounded-lg flex items-center gap-2 text-white">
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="checkbox checkbox-xs checkbox-primary rounded" />
            <span className="text-base-content/75 font-medium">Remember me</span>
          </label>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-primary hover:underline font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="mt-2">
          Sign In
        </Button>
      </form>

      <div className="divider text-xs text-base-content/40 my-6">OR DEMO CREDENTIALS</div>

      <button
        onClick={handleDemoFill}
        className="btn btn-outline btn-sm w-full normal-case font-medium hover:bg-base-200 hover:text-base-content border-base-300"
      >
        Auto-Fill Admin Account
      </button>

      <div className="text-center mt-6 text-sm text-base-content/60">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="text-primary hover:underline font-semibold">
          Create one now
        </Link>
      </div>
    </Card>
  );
};
