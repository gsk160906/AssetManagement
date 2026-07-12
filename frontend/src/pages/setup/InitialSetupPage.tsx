import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, Sparkles, Building, User, Mail, Lock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const InitialSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [organizationName, setOrganizationName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time strength check
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-base-300' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = [
      'bg-error',
      'bg-error',
      'bg-warning',
      'bg-info',
      'bg-success',
      'bg-success'
    ];

    return {
      score,
      label: labels[score],
      color: colors[score]
    };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!name.trim()) newErrors.name = 'Administrator name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (strength.score < 5) {
      newErrors.password = 'Password must contain uppercase, lowercase, numbers, and special characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/system/initialize', {
        organizationName,
        name,
        email,
        password,
        confirmPassword
      });

      if (response.data?.success && response.data?.data) {
        const { token } = response.data.data;
        localStorage.setItem('token', token);
        await refreshUser(); // Immediately sync state
        toast.success('System initialized successfully. Welcome to AssetFlow ERP.');
        navigate('/dashboard');
        
        // Trigger a force reload of system initialized status state
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'System initialization failed.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-base-300 via-base-200 to-base-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border border-base-300 shadow-xl bg-base-100/90 backdrop-blur-md p-6 sm:p-8">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-primary/25 mb-4 animate-pulse">
            <Sparkles size={26} />
          </div>
          <h2 className="text-2xl font-bold text-base-content tracking-tight">Welcome to AssetFlow ERP</h2>
          <p className="text-xs text-base-content/50 mt-1 max-w-sm">
            Let's configure your organization and create the first Administrator account.
          </p>
        </div>

        {errors.form && (
          <div className="alert alert-error text-xs py-2.5 px-3 mb-4 rounded-xl flex items-center gap-2 text-white">
            <ShieldCheck size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="AssetFlow Inc."
            icon={<Building size={16} />}
            error={errors.organizationName}
          />

          <Input
            label="Administrator Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah Jenkins"
            icon={<User size={16} />}
            error={errors.name}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            icon={<Mail size={16} />}
            error={errors.email}
          />

          <div className="form-control w-full relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-base-content/40 hover:text-base-content"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            
            {password && (
              <div className="mt-1 space-y-1 px-1">
                <div className="flex justify-between items-center text-[9px] font-bold text-base-content/50">
                  <span>Strength: {strength.label}</span>
                  <span>{strength.score}/5</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-300`} 
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-control w-full relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-base-content/40 hover:text-base-content"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            className="mt-6 rounded-xl flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : null}
            Create Administrator
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default InitialSetupPage;
