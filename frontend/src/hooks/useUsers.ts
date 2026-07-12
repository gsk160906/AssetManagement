import { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser } from '../services/userService';
import type { UserFilters } from '../services/userService';
import toast from 'react-hot-toast';

export const useUsers = (initialFilters: UserFilters = {}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page || 1);
  const [limit, setLimit] = useState(initialFilters.limit || 10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [search, setSearch] = useState(initialFilters.search || '');
  const [role, setRole] = useState(initialFilters.role || '');
  const [status, setStatus] = useState(initialFilters.status || '');
  const [departmentId, setDepartmentId] = useState(initialFilters.departmentId || '');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUsers({
        search,
        role,
        status,
        departmentId,
        page,
        limit
      });
      if (res.success && res.data) {
        setUsers(res.data.users ?? []);
        setTotal(res.data.pagination?.total ?? 0);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch users.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [search, role, status, departmentId, page, limit]);

  const removeUser = async (id: string) => {
    try {
      const res = await deleteUser(id);
      if (res.success) {
        toast.success('User deleted successfully.');
        fetchUsers();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete user.';
      toast.error(msg);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    departmentId,
    setDepartmentId,
    refetch: fetchUsers,
    removeUser
  };
};
