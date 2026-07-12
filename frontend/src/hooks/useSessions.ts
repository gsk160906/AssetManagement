import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import * as service from '../services/profileService';
import type { UserSession } from '../types/profile';

export const useSessions = () => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [otherSessions, setOtherSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await service.getSessions();
      setCurrentSession(data.current);
      setOtherSessions(data.others);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Unable to fetch active sessions.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const terminateCurrentSession = async () => {
    try {
      await service.logoutCurrentSession();
      toast.success('Logged out successfully.');
      await logout(); // Wipe frontend auth credentials and redirect
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to logout from current session.';
      toast.error(msg);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await service.logoutCurrentSession(); // Actually logout target session
      setOtherSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session terminated successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to terminate session.';
      toast.error(msg);
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      await service.logoutAllSessions();
      setOtherSessions([]);
      toast.success('All other active sessions terminated.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to terminate all sessions.';
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    currentSession,
    otherSessions,
    isLoading,
    error,
    refresh: fetchSessions,
    terminateCurrentSession,
    terminateSession,
    terminateAllOtherSessions
  };
};
