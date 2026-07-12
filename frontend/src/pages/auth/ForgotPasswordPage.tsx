import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ROUTES } from '../../constants/routes';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (data.email) {
      setIsSubmitted(true);
    } else {
      setErrorMsg('Failed to process. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md border border-base-300 shadow-xl bg-base-100/90 backdrop-blur-md">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/25 mb-3">
          A
        </div>
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Reset Password</h2>
        <p className="text-sm text-base-content/60 mt-1">We will send you instructions to reset your password</p>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-sm py-2 px-3 mb-4 rounded-lg flex items-center gap-2 text-white">
          <ShieldAlert size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-4">
          <div className="alert alert-success text-sm py-3 px-4 rounded-xl flex items-start gap-3 bg-success/15 border-success/30 text-success-content font-medium">
            <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-success-content text-base">Check your email</p>
              <p className="text-sm text-success-content/80 mt-1">
                We have sent password reset instructions to your email address.
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="btn btn-outline btn-md w-full normal-case font-medium mt-4 flex items-center justify-center gap-2 border-base-300"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="mt-2">
            Send Reset Instructions
          </Button>

          <Link
            to={ROUTES.LOGIN}
            className="btn btn-ghost btn-sm w-full normal-case font-semibold flex items-center justify-center gap-2 text-base-content/60 hover:text-base-content"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </form>
      )}
    </Card>
  );
};
