import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import type { Notification, NotificationFilters } from '../types/notification';
import * as service from '../services/notificationService';

export const useNotifications = (initialFilters: Partial<NotificationFilters> = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 10,
    ...initialFilters
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const prevUnreadCountRef = useRef(0);

  // Debouncing search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setFilters(prev => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const activeFilters = {
        ...filters,
        ...(debouncedSearch ? { search: debouncedSearch } : {})
      };
      
      const response = await service.getNotifications(activeFilters);
      if (response.success) {
        setNotifications(response.data.notifications ?? []);
        setTotal(response.data.total ?? 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, debouncedSearch]);

  // Load unread/total count
  const fetchCounts = useCallback(async () => {
    try {
      const response = await service.getUnreadCount();
      if (response.success) {
        const count = response.data.unread || 0;
        setUnreadCount(count);

        // Native Browser Notification Trigger if count increases
        if (count > prevUnreadCountRef.current) {
          triggerNativeNotification();
        }
        prevUnreadCountRef.current = count;
      }
    } catch (err) {
      console.error('Failed to load notifications count:', err);
    }
  }, []);

  const triggerNativeNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AssetFlow Notification', {
        body: 'You have new unread messages in your Notification Center.',
        icon: '/favicon.ico'
      });
    }
  };

  // Pull Data
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling counts and items every 30s
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(() => {
      fetchCounts();
      fetchNotifications(false); // background refresh (no loading flicker)
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCounts, fetchNotifications]);

  // Request browser permission for notifications
  const requestBrowserPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Actions
  const handleMarkRead = async (id: string) => {
    try {
      const res = await service.markRead(id);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
        );
        fetchCounts();
      }
    } catch (err) {
      toast.error('Failed to mark notification as read.');
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      const res = await service.markUnread(id);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, is_read: false } : n))
        );
        fetchCounts();
      }
    } catch (err) {
      toast.error('Failed to mark notification as unread.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await service.markAllRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read.');
      }
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await service.deleteNotification(id);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        fetchCounts();
        toast.success('Notification deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete notification.');
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const res = await service.deleteReadNotifications();
      if (res.success) {
        setNotifications(prev => prev.filter(n => !n.is_read));
        fetchCounts();
        toast.success('All read notifications deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete read notifications.');
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleCategoryFilter = (category?: any) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  };

  const handlePriorityFilter = (priority?: any) => {
    setFilters(prev => ({ ...prev, priority, page: 1 }));
  };

  const handleStatusFilter = (status?: any) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  return {
    notifications,
    total,
    unreadCount,
    isLoading,
    error,
    filters,
    searchQuery,
    setSearchQuery,
    refetch: () => {
      fetchNotifications();
      fetchCounts();
    },
    markRead: handleMarkRead,
    markUnread: handleMarkUnread,
    markAllRead: handleMarkAllRead,
    deleteNotification: handleDelete,
    deleteReadNotifications: handleDeleteAllRead,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    setCategory: handleCategoryFilter,
    setPriority: handlePriorityFilter,
    setStatus: handleStatusFilter,
    requestBrowserPermission
  };
};
