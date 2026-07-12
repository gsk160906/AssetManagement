import { useState, useEffect, useCallback } from 'react';
import { getAvailableReports, getReportHistory } from '../services/reportService';

export const useReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reportsRes, historyRes] = await Promise.all([
        getAvailableReports(),
        getReportHistory().catch(() => ({ success: false, data: { history: [] } }))
      ]);

      if (reportsRes.success) {
        setReports(reportsRes.data.reports ?? []);
      }
      if (historyRes.success) {
        setHistory(historyRes.data.history ?? []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports metadata.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  return {
    reports,
    history,
    isLoading,
    error,
    refetch: fetchMeta
  };
};

export default useReports;
