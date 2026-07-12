import { api } from './api';

export interface ReportExportParams {
  type: 'ASSET_REPORT' | 'MAINTENANCE_REPORT' | 'AUDIT_REPORT' | 'BOOKING_REPORT' | 'EXPENSE_REPORT';
  format: 'CSV' | 'PDF';
  filters?: Record<string, any>;
}

export const getAvailableReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const getAssetReport = async (params: any = {}) => {
  const response = await api.get('/reports/assets', { params });
  return response.data;
};

export const getMaintenanceReport = async (params: any = {}) => {
  const response = await api.get('/reports/maintenance', { params });
  return response.data;
};

export const getAuditReport = async (params: any = {}) => {
  const response = await api.get('/reports/audits', { params });
  return response.data;
};

export const getBookingReport = async (params: any = {}) => {
  const response = await api.get('/reports/bookings', { params });
  return response.data;
};

export const getExpenseReport = async (params: any = {}) => {
  const response = await api.get('/reports/expenses', { params });
  return response.data;
};

export const getReportHistory = async () => {
  const response = await api.get('/reports/history');
  return response.data;
};

export const exportReport = async (data: ReportExportParams) => {
  const response = await api.post('/reports/export', data);
  return response.data;
};

export default {
  getAvailableReports,
  getAssetReport,
  getMaintenanceReport,
  getAuditReport,
  getBookingReport,
  getExpenseReport,
  getReportHistory,
  exportReport
};
