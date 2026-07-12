import * as dashboardRepository from './dashboard.repository.js';
import * as analyticsRepository from './analytics.repository.js';
import * as mapper from './dashboard.mapper.js';
import { RANGE_INTERVALS } from './dashboard.constants.js';

export const getOverview = async (user) => {
  const stats = await dashboardRepository.getOverviewStats(user.id, user.role, user.department_id);
  return mapper.mapOverviewStats(stats);
};

export const getCharts = async (user) => {
  // Resolve stats concurrently via Promise.all()
  const [assetStatusRows, departmentAssetRows, categoryAssetRows, maintenanceCostRows] = await Promise.all([
    analyticsRepository.getAssetStatusStats(user.role, user.role === 'EMPLOYEE' ? user.id : user.department_id),
    analyticsRepository.getDepartmentStats(),
    analyticsRepository.getCategoryStats(user.role, user.role === 'EMPLOYEE' ? user.id : user.department_id),
    analyticsRepository.getMaintenanceCostTrend(user.role, user.role === 'EMPLOYEE' ? user.id : user.department_id),
  ]);

  return {
    assetStatus: mapper.mapAssetStatus(assetStatusRows),
    departmentAssets: mapper.mapDepartmentStats(departmentAssetRows),
    categoryAssets: mapper.mapCategoryStats(categoryAssetRows),
    maintenanceTrend: mapper.mapMaintenanceTrend(maintenanceCostRows),
  };
};

export const getActivities = async (user, limit, offset, range) => {
  const rangeInterval = RANGE_INTERVALS[range] || null;
  const rows = await dashboardRepository.getRecentActivities(
    user.id,
    user.role,
    user.department_id,
    limit,
    offset,
    rangeInterval
  );
  
  return rows.map((r) => ({
    id: r.id,
    actor: r.user_name || 'System',
    action: r.action,
    module: r.module,
    entity: r.entity,
    timestamp: r.created_at,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
  }));
};

export const getBookings = async (user, limit, offset) => {
  const rows = await dashboardRepository.getUpcomingBookings(
    user.id,
    user.role,
    user.department_id,
    limit,
    offset
  );
  return rows.map((r) => ({
    id: r.id,
    assetName: r.asset_name,
    employeeName: r.employee_name,
    startTime: r.start_time,
    endTime: r.end_time,
    purpose: r.purpose,
    status: r.status,
  }));
};

export const getMaintenance = async (user) => {
  const summary = await analyticsRepository.getMaintenanceSummary(
    user.role,
    user.role === 'EMPLOYEE' ? user.id : user.department_id
  );
  return {
    pending: parseInt(summary.pending || 0, 10),
    inProgress: parseInt(summary.in_progress || 0, 10),
    resolved: parseInt(summary.resolved || 0, 10),
    rejected: parseInt(summary.rejected || 0, 10),
    avgRepairCost: parseFloat(summary.avg_repair_cost || 0),
    totalCost: parseFloat(summary.total_cost || 0),
  };
};

export const getNotifications = async (user, limit, offset) => {
  const [unreadCount, latestNotifications] = await Promise.all([
    dashboardRepository.getNotificationsCount(user.id),
    dashboardRepository.getNotifications(user.id, limit, offset),
  ]);

  return {
    count: unreadCount,
    latest: latestNotifications.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      isRead: r.is_read,
      createdAt: r.created_at,
    })),
  };
};
