import { api } from './api';

export interface AuditFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface AuditCreateData {
  audit_name: string;
  description?: string;
  auditor_id: string;
  audit_type: 'full' | 'department' | 'location' | 'random';
  start_date: string;
}

export interface AssetVerificationData {
  verification_status: 'verified' | 'missing' | 'damaged' | 'relocated' | 'not_found' | 'pending';
  actual_location?: string | null;
  remarks?: string | null;
}

export const getAudits = async (params: AuditFilters = {}) => {
  const response = await api.get('/audits', { params });
  return response.data;
};

export const getAuditById = async (id: string) => {
  const response = await api.get(`/audits/${id}`);
  return response.data;
};

export const createAudit = async (data: AuditCreateData) => {
  const response = await api.post('/audits', data);
  return response.data;
};

export const startAudit = async (id: string) => {
  const response = await api.patch(`/audits/${id}/start`);
  return response.data;
};

export const cancelAudit = async (id: string) => {
  const response = await api.patch(`/audits/${id}/cancel`);
  return response.data;
};

export const completeAudit = async (id: string) => {
  const response = await api.patch(`/audits/${id}/complete`);
  return response.data;
};

export const verifyAsset = async (auditId: string, assetId: string, data: AssetVerificationData) => {
  const response = await api.patch(`/audits/${auditId}/assets/${assetId}`, data);
  return response.data;
};

export const bulkVerifyAssets = async (id: string, assetsList: { id: string; status: string; actual_location?: string | null; remarks?: string | null }[]) => {
  const response = await api.patch(`/audits/${id}/assets/bulk`, { assets: assetsList });
  return response.data;
};

export const getAuditProgress = async (id: string) => {
  const response = await api.get(`/audits/${id}/progress`);
  return response.data;
};

export const getAuditReport = async (id: string) => {
  const response = await api.get(`/audits/${id}/report`);
  return response.data;
};

export const getAuditItemsList = async (id: string, params: { status?: string; q?: string } = {}) => {
  const response = await api.get(`/audits/${id}/items`, { params });
  return response.data;
};

export const getAuditLogs = async (id: string) => {
  const response = await api.get(`/audits/${id}/logs`);
  return response.data;
};

export default {
  getAudits,
  getAuditById,
  createAudit,
  startAudit,
  cancelAudit,
  completeAudit,
  verifyAsset,
  bulkVerifyAssets,
  getAuditProgress,
  getAuditReport,
  getAuditItemsList,
  getAuditLogs
};
