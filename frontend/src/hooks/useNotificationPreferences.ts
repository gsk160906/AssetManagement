import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { NotificationPreferences } from '../types/notification';
import * as service from '../services/notificationService';

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await service.getPreferences();
      if (response.success) {
        setPreferences(response.data.preferences);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load preferences.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    
    // Optimistic Update
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      const response = await service.updatePreferences({ [key]: value });
      if (response.success) {
        toast.success('Preference updated successfully.');
      } else {
        // Rollback
        setPreferences(preferences);
        toast.error('Failed to update preference.');
      }
    } catch (err) {
      // Rollback
      setPreferences(preferences);
      toast.error('Failed to update preference.');
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    refetch: fetchPreferences
  };
};
