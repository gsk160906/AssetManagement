import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Building, User, Mail, Lock, Code, Award } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useDepartments } from '../../hooks/useDepartments';
import { createUser, updateUser } from '../../services/userService';
import toast from 'react-hot-toast';

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: any; // If present, we are in Edit mode
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userToEdit
}) => {
  const isEdit = !!userToEdit;
  const { departments } = useDepartments();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setEmployeeCode(userToEdit.employee_code || '');
      setRole(userToEdit.role || 'EMPLOYEE');
      setDepartmentId(userToEdit.department_id || '');
      setStatus(userToEdit.status || 'ACTIVE');
      setPassword('');
      setConfirmPassword('');
    } else {
      setName('');
      setEmail('');
      setEmployeeCode('');
      setRole('EMPLOYEE');
      setDepartmentId('');
      setStatus('ACTIVE');
      setPassword('');
      setConfirmPassword('');
    }
    setErrors({});
  }, [isEdit, userToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!employeeCode.trim()) newErrors.employeeCode = 'Employee code is required';

    if (!isEdit) {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else {
        // Enforce same complexity rules
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
          newErrors.password = 'Password must contain uppercase, lowercase, numbers, and special characters';
        }
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: any = {
        name,
        email,
        role,
        departmentId: departmentId || null,
        status
      };

      if (isEdit) {
        await updateUser(userToEdit.id, payload);
        toast.success('User updated successfully.');
      } else {
        payload.employeeCode = employeeCode;
        payload.password = password;
        await createUser(payload);
        toast.success('User created successfully.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save user.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-base-100 rounded-3xl border border-base-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-base-300 bg-base-200/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base-content text-lg">
                {isEdit ? 'Edit Employee Account' : 'Add New Employee'}
              </h3>
              <p className="text-xs text-base-content/50">
                {isEdit ? 'Update employee designation, status, or role' : 'Configure login credentials and details'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.form && (
            <div className="alert alert-error text-xs py-2 px-3 rounded-xl text-white">
              <span>{errors.form}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Michael Scott"
              icon={<User size={16} />}
              error={errors.name}
            />

            <Input
              label="Employee Code"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="e.g. EMP-101"
              icon={<Code size={16} />}
              disabled={isEdit} // Disable editing employee code to preserve audit trails
              error={errors.employeeCode}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. michael.scott@company.com"
            icon={<Mail size={16} />}
            error={errors.email}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-bold text-base-content/70">Department</span>
              </label>
              <div className="relative">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="select select-bordered w-full rounded-xl bg-base-100 pl-10 text-sm focus:outline-none focus:border-primary border-base-300"
                >
                  <option value="">No Department / External</option>
                  {departments?.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3.5 top-3.5 text-base-content/40">
                  <Building size={16} />
                </div>
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-bold text-base-content/70">System Role</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="select select-bordered w-full rounded-xl bg-base-100 pl-10 text-sm focus:outline-none focus:border-primary border-base-300"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="ASSET_MANAGER">Asset Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <div className="absolute left-3.5 top-3.5 text-base-content/40">
                  <Award size={16} />
                </div>
              </div>
            </div>
          </div>

          {isEdit ? (
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-bold text-base-content/70">Account Status</span>
              </label>
              <div className="flex gap-4 p-1">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={status === 'ACTIVE'}
                    onChange={() => setStatus('ACTIVE')}
                    className="radio radio-primary radio-sm"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="INACTIVE"
                    checked={status === 'INACTIVE'}
                    onChange={() => setStatus('INACTIVE')}
                    className="radio radio-error radio-sm"
                  />
                  Inactive
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="form-control w-full relative">
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<Lock size={16} />}
                  error={errors.confirmPassword}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEdit ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditUserModal;
