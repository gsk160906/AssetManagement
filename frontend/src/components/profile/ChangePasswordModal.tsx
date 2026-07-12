import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import * as service from '../../services/profileService';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Real-time password strength checks
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

  const strength = getPasswordStrength(newPassword);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (strength.score < 5) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, number, and special character';
    }

    if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password cannot match the current password';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await service.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully. Please log in again.');
      
      // The backend invalidates all sessions, so we must log out the client
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 1500);

      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Incorrect current password.';
      setErrors({ currentPassword: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-2xl border border-base-300 max-w-md bg-base-100 p-6 relative">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/50 hover:text-base-content"
        >
          <X size={16} />
        </button>

        <h3 className="font-bold text-lg text-base-content flex items-center gap-2 mb-2">
          <KeyRound size={20} className="text-primary" />
          Change Password
        </h3>
        <p className="text-xs text-base-content/60 mb-6">
          Update your password regularly to keep your account secure.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-bold text-base-content/70">Current Password</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`input input-bordered w-full rounded-xl pr-10 text-sm ${errors.currentPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="text-error text-[10px] mt-1">{errors.currentPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-bold text-base-content/70">New Password</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`input input-bordered w-full rounded-xl pr-10 text-sm ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength Bar */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-base-content/50">
                  <span>Strength: {strength.label}</span>
                  <span>{strength.score}/5</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-300`} 
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {errors.newPassword && (
              <span className="text-error text-[10px] mt-1">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-bold text-base-content/70">Confirm New Password</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input input-bordered w-full rounded-xl pr-10 text-sm ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-error text-[10px] mt-1">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="modal-action mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-ghost text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary text-xs rounded-xl px-6"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-4 h-4 mr-1" />
              ) : null}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ChangePasswordModal;
