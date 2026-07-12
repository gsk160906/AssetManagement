import { useState, useEffect, useCallback } from 'react';
import { getDepartments } from '../services/departmentService';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDepartments({
        q: searchQuery || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setDepartments(res.data.departments ?? []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load departments list.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refetch: fetchDepartments
  };
};

export default useDepartments;
