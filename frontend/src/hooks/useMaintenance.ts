import { useState, useEffect, useCallback } from 'react';
import { getMaintenances, getMaintenanceStats } from '../services/maintenanceService';

export interface MaintenanceFilters {
  q: string;
  priority: string;
  status: string;
}

export interface UseMaintenanceResult {
  tickets: any[];
  stats: any | null;
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  filters: MaintenanceFilters;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<MaintenanceFilters>) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
  removeTicket: (id: string) => void;
  updateTicketInList: (id: string, patch: any) => void;
}

const DEFAULT_FILTERS: MaintenanceFilters = { q: '', priority: '', status: '' };
const LIMIT = 10;

export const useMaintenance = (): UseMaintenanceResult => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState<MaintenanceFilters>(DEFAULT_FILTERS);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketRes, statsRes] = await Promise.all([
        getMaintenances({ ...filters, page, limit: LIMIT }),
        getMaintenanceStats()
      ]);
      if (ticketRes.success) {
        setTickets(ticketRes.data.tickets ?? []);
        setTotal(ticketRes.data.total ?? 0);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('useMaintenance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setFilters = (patch: Partial<MaintenanceFilters>) => {
    setFiltersState(prev => ({ ...prev, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  };

  // Optimistic removal — remove from list without full refetch
  const removeTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
  };

  // Optimistic patch — update a single ticket in the list
  const updateTicketInList = (id: string, patch: any) => {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const totalPages = Math.ceil(total / LIMIT);

  return { tickets, stats, total, page, totalPages, isLoading, filters, setPage, setFilters, resetFilters, refetch: fetchAll, removeTicket, updateTicketInList };
};

export default useMaintenance;
