import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import type { UserProfile } from '../../types/profile';

interface ProfileFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<any>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    phone_number: profile.phone_number || '',
    designation: profile.designation || '',
    bio: profile.bio || '',
    timezone: profile.timezone || 'UTC',
    language: profile.language || 'English',
    date_format: profile.date_format || 'YYYY-MM-DD',
    theme: profile.theme || 'SYSTEM'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (formData.first_name.length < 2) newErrors.first_name = 'First name must be at least 2 characters';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (formData.last_name.length < 2) newErrors.last_name = 'Last name must be at least 2 characters';
    if (formData.bio && formData.bio.length > 500) newErrors.bio = 'Bio cannot exceed 500 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      navigate('/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-xs text-base-content/70">First Name</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="John"
            className={`input input-bordered w-full rounded-xl text-sm ${errors.first_name ? 'input-error' : ''}`}
          />
          {errors.first_name && (
            <label className="label">
              <span className="label-text-alt text-error text-[10px]">{errors.first_name}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-xs text-base-content/70">Last Name</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Doe"
            className={`input input-bordered w-full rounded-xl text-sm ${errors.last_name ? 'input-error' : ''}`}
          />
          {errors.last_name && (
            <label className="label">
              <span className="label-text-alt text-error text-[10px]">{errors.last_name}</span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-xs text-base-content/70">Email Address</span>
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="input input-bordered w-full rounded-xl text-sm bg-base-200/50 cursor-not-allowed opacity-75"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-xs text-base-content/70">Phone Number</span>
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+1 (555) 019-2834"
            className="input input-bordered w-full rounded-xl text-sm"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-xs text-base-content/70">Designation</span>
          </label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="IT Systems Administrator"
            className="input input-bordered w-full rounded-xl text-sm"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold text-xs text-base-content/70">Department</span>
          </label>
          <input
            type="text"
            value={profile.department_name || 'Unassigned'}
            disabled
            className="input input-bordered w-full rounded-xl text-sm bg-base-200/50 cursor-not-allowed opacity-75"
          />
        </div>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-bold text-xs text-base-content/70">Bio / Notes</span>
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          placeholder="Write a short bio about yourself..."
          className={`textarea textarea-bordered w-full rounded-xl text-sm ${errors.bio ? 'textarea-error' : ''}`}
        />
        {errors.bio ? (
          <label className="label">
            <span className="label-text-alt text-error text-[10px]">{errors.bio}</span>
          </label>
        ) : (
          <label className="label">
            <span className="label-text-alt text-base-content/40 text-[9px]">Limit 500 characters. HTML tags are automatically stripped.</span>
          </label>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-base-300/40">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="btn btn-ghost text-xs rounded-xl flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary text-xs rounded-xl flex items-center gap-2 px-6"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Save size={14} />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
};
export default ProfileForm;
