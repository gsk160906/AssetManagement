export const mapOverviewStats = (stats) => {
  return {
    totalAssets: parseInt(stats.total_assets || 0, 10),
    availableAssets: parseInt(stats.available_assets || 0, 10),
    allocatedAssets: parseInt(stats.allocated_assets || 0, 10),
    reservedAssets: parseInt(stats.reserved_assets || 0, 10),
    underMaintenanceAssets: parseInt(stats.under_maintenance_assets || 0, 10),
    retiredAssets: parseInt(stats.retired_assets || 0, 10),
    disposedAssets: parseInt(stats.disposed_assets || 0, 10),
    totalEmployees: parseInt(stats.total_employees || 0, 10),
    totalDepartments: parseInt(stats.total_departments || 0, 10),
    pendingTransfers: parseInt(stats.pending_transfers || 0, 10),
    pendingMaintenance: parseInt(stats.pending_maintenance || 0, 10),
    unreadNotifications: parseInt(stats.unread_notifications || 0, 10),
  };
};

export const mapAssetStatus = (rows) => {
  const statusMap = {
    AVAILABLE: 0,
    ALLOCATED: 0,
    RESERVED: 0,
    UNDER_MAINTENANCE: 0,
    RETIRED: 0,
    DISPOSED: 0,
  };

  rows.forEach((r) => {
    if (r.status in statusMap) {
      statusMap[r.status] = parseInt(r.count, 10);
    }
  });

  return Object.keys(statusMap).map((k) => ({
    name: k.replace('_', ' '),
    value: statusMap[k],
  }));
};

export const mapDepartmentStats = (rows) => {
  return rows.map((r) => ({
    name: r.department_name || 'Unassigned',
    value: parseInt(r.asset_count, 10),
  }));
};

export const mapCategoryStats = (rows) => {
  return rows.map((r) => ({
    name: r.category_name,
    value: parseInt(r.asset_count, 10),
  }));
};

export const mapMaintenanceTrend = (rows) => {
  return rows.map((r) => ({
    month: r.month_name,
    cost: parseFloat(r.total_cost || 0),
  }));
};
