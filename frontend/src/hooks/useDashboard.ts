import { useState, useEffect, useCallback } from 'react';
import * as service from '../services/dashboardService';

export interface OverviewStats {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  underMaintenanceAssets: number;
  reservedAssets: number;
  retiredAssets: number;
  disposedAssets: number;
  totalEmployees: number;
  totalDepartments: number;
  pendingTransfers: number;
  pendingMaintenance: number;
  unreadNotifications: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MaintenanceTrendPoint {
  month: string;
  cost: number;
}

export interface ChartsData {
  assetStatus: ChartDataPoint[];
  departmentAssets: ChartDataPoint[];
  categoryAssets: ChartDataPoint[];
  maintenanceTrend: MaintenanceTrendPoint[];
}

export interface Activity {
  id: string;
  actor: string;
  action: string;
  module: string;
  entity: string;
  timestamp: string;
  metadata?: any;
}

export interface Booking {
  id: string;
  assetName: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

export interface MaintenanceSummary {
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  avgRepairCost: number;
  totalCost: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsData {
  count: number;
  latest: NotificationItem[];
}

export const useDashboardSection = <T>(
  fetchFn: (...args: any[]) => Promise<{ success: boolean; data: T }>,
  ...args: any[]
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFn(...args);
      if (res.success) {
        setData(res.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, JSON.stringify(args)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData };
};

// Typed specific hook triggers
export const useDashboardOverview = () => {
  return useDashboardSection<OverviewStats>(service.getOverview);
};

export const useDashboardCharts = () => {
  return useDashboardSection<ChartsData>(service.getCharts);
};

export const useDashboardActivities = (page = 1, limit = 10, range = '30d') => {
  return useDashboardSection<Activity[]>(service.getActivities, page, limit, range);
};

export const useDashboardBookings = (page = 1, limit = 5) => {
  return useDashboardSection<Booking[]>(service.getBookings, page, limit);
};

export const useDashboardMaintenance = () => {
  return useDashboardSection<MaintenanceSummary>(service.getMaintenance);
};

export const useDashboardNotifications = (page = 1, limit = 5) => {
  return useDashboardSection<NotificationsData>(service.getNotifications, page, limit);
};
