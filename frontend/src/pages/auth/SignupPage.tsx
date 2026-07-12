import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, ShieldAlert } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ROUTES } from '../../constants/routes';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      localStorage.setItem('token', 'mock-jwt-session-token');
      localStorage.setItem('user', JSON.stringify({ email: data.email, role: 'ADMIN', name: data.name }));
      navigate(ROUTES.DASHBOARD);
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md border border-base-300 shadow-xl bg-base-100/90 backdrop-blur-md">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/25 mb-3">
          A
        </div>
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Create your Account</h2>
        <p className="text-sm text-base-content/60 mt-1">Get started with AssetFlow ERP</p>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-sm py-2 px-3 mb-4 rounded-lg flex items-center gap-2 text-white">
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />

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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center mt-6 text-sm text-base-content/60">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </Card>
  );
};
