import { useState, useEffect, useCallback } from 'react';
import { getAudits } from '../services/auditService';

export interface AuditFiltersState {
  status: string;
}

const DEFAULT_FILTERS: AuditFiltersState = {
  status: ''
};

const LIMIT = 10;

export const useAudits = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AuditFiltersState>(DEFAULT_FILTERS);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAudits({
        status: filters.status || undefined,
        page,
        limit: LIMIT
      });
      if (res.success) {
        setAudits(res.data.audits ?? []);
        setTotal(res.data.total ?? 0);
      } else {
        setError(res.message || 'Failed to fetch audits list');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load audit sessions.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const setFilters = (patch: Partial<AuditFiltersState>) => {
    setFiltersState(prev => ({ ...prev, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return {
    audits,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setPage,
    setFilters,
    resetFilters,
    refetch: fetchList
  };
};

export default useAudits;
