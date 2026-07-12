import { useState, useEffect, useCallback } from 'react';
import { getBookings, getMyBookings, getBookingStats, getCalendarEvents } from '../services/bookingService';

export interface BookingFiltersState {
  q: string;
  status: string;
  departmentId: string;
  resourceId: string;
  date: string;
  onlyMine: boolean;
}

const DEFAULT_FILTERS: BookingFiltersState = {
  q: '',
  status: '',
  departmentId: '',
  resourceId: '',
  date: '',
  onlyMine: false
};

const LIMIT = 10;

export const useBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<BookingFiltersState>(DEFAULT_FILTERS);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiParams = {
        q: filters.q || undefined,
        status: filters.status || undefined,
        departmentId: filters.departmentId || undefined,
        resourceId: filters.resourceId || undefined,
        date: filters.date || undefined,
        page,
        limit: LIMIT
      };

      const fetchList = filters.onlyMine ? getMyBookings(apiParams) : getBookings(apiParams);

      const [listRes, statsRes, calRes] = await Promise.all([
        fetchList,
        getBookingStats().catch(() => ({ success: false, data: null })),
        getCalendarEvents().catch(() => ({ success: false, data: { events: [] } }))
      ]);

      if (listRes.success) {
        setBookings(listRes.data.bookings ?? []);
        setTotal(listRes.data.total ?? 0);
      } else {
        setError(listRes.message || 'Failed to fetch bookings list');
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (calRes.success) {
        setCalendarEvents(calRes.data.events ?? []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setFilters = (patch: Partial<BookingFiltersState>) => {
    setFiltersState(prev => ({ ...prev, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  };

  const removeBookingFromList = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
  };

  const updateBookingInList = (id: string, patch: any) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
  };

  const totalPages = Math.ceil(total / LIMIT);

  return {
    bookings,
    stats,
    calendarEvents,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setPage,
    setFilters,
    resetFilters,
    refetch: fetchAll,
    removeBookingFromList,
    updateBookingInList
  };
};

export default useBookings;
