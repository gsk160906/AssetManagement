import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import * as service from '../services/profileService';
import type { UserProfile } from '../types/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getProfile();
      setProfile(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Unable to load profile. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    setError(null);
    try {
      const updated = await service.updateProfile(data);
      setProfile(updated);
      await refreshUser(); // Immediately sync Navbar and Dashboard
      toast.success('Profile updated successfully.');
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(msg);
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const result = await service.uploadAvatar(formData);
      if (profile) {
        setProfile({ ...profile, profile_image_url: result.profile_image_url });
      }
      await refreshUser(); // Sync Navbar and Dashboard
      toast.success('Profile picture updated successfully.');
      return result.profile_image_url;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Avatar upload failed.';
      toast.error(msg);
      throw err;
    }
  };

  const deleteAvatar = async () => {
    try {
      await service.deleteAvatar();
      if (profile) {
        setProfile({ ...profile, profile_image_url: null });
      }
      await refreshUser(); // Sync Navbar and Dashboard
      toast.success('Profile picture removed.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove profile picture.';
      toast.error(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar
  };
};
