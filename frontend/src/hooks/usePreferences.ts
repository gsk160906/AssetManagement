import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from './useTheme';
import { THEMES } from '../constants/themes';
import * as service from '../services/profileService';
import type { UserPreferences } from '../types/profile';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getPreferences();
      setPreferences(data);

      // Synchronize theme with ThemeContext
      if (data.theme === 'LIGHT') {
        setTheme(THEMES.LIGHT);
      } else if (data.theme === 'DARK') {
        setTheme(THEMES.DARK);
      } else if (data.theme === 'SYSTEM') {
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemDark ? THEMES.DARK : THEMES.LIGHT);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Unable to load preferences.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    // Optimistic UI update
    const previous = preferences;
    if (preferences) {
      setPreferences({ ...preferences, ...data });
    }

    try {
      const updated = await service.updatePreferences(data);
      setPreferences(updated);

      // Synchronize theme if changed
      if (data.theme) {
        if (data.theme === 'LIGHT') {
          setTheme(THEMES.LIGHT);
        } else if (data.theme === 'DARK') {
          setTheme(THEMES.DARK);
        } else if (data.theme === 'SYSTEM') {
          const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(systemDark ? THEMES.DARK : THEMES.LIGHT);
        }
      }

      toast.success('Preferences auto-saved.');
      return updated;
    } catch (err: any) {
      // Rollback on error
      setPreferences(previous);
      const msg = err.response?.data?.message || 'Failed to save preferences.';
      toast.error(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    refresh: fetchPreferences,
    updatePreferences
  };
};
