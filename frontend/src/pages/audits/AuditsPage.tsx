import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ClipboardCheck, Plus, Eye, RefreshCw, X, Play, Trash2, Filter
} from 'lucide-react';
import { useAudits } from '../../hooks/useAudits';
import { createAudit, startAudit, cancelAudit } from '../../services/auditService';
import { api } from '../../services/api';

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const AuditStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    planned: 'badge-ghost text-base-content/60',
    in_progress: 'badge-info text-info-content',
    completed: 'badge-success text-success-content',
    cancelled: 'badge-error text-error-content'
  };
  return (
    <span className={`badge badge-sm font-bold uppercase ${map[status] ?? 'badge-ghost'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AuditsPage: React.FC = () => {
  const {
    audits, total, page, totalPages, isLoading,
    filters, setPage, setFilters, resetFilters, refetch
  } = useAudits();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<'full' | 'department' | 'location' | 'random'>('full');
  const [formStartDate, setFormStartDate] = useState('');
  const [formAuditorId, setFormAuditorId] = useState('');

  // Dropdown data
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load active users for Auditor select dropdown
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setAllUsers(res.data.data.users ?? []);
        if (res.data.data.users?.length > 0) {
          setFormAuditorId(res.data.data.users[0].id);
        }
      }
    } catch { /* silent */ }
    finally { setIsLoadingUsers(false); }
  };

  const openCreate = () => {
    loadUsers();
    setFormName('');
    setFormDesc('');
    setFormType('full');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuditorId) return toast.error('Please assign an auditor.');
    setIsProcessing(true);
    try {
      const res = await createAudit({
        audit_name: formName,
        description: formDesc || undefined,
        auditor_id: formAuditorId,
        audit_type: formType,
        start_date: formStartDate
      });
      if (res.success) {
        toast.success('Inventory audit session planned successfully!');
        setIsCreateOpen(false);
        refetch();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to plan audit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = async (id: string, code: string) => {
    if (!window.confirm(`Start audit session "${code}"? This will snapshot all active physical assets as pending items.`)) return;
    try {
      const res = await startAudit(id);
      if (res.success) {
        toast.success('Audit session started. Dispatched verification tasks.');
        refetch();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start audit.');
    }
  };

  const handleCancel = async (id: string, code: string) => {
    if (!window.confirm(`Cancel audit session "${code}"?`)) return;
    try {
      const res = await cancelAudit(id);
      if (res.success) {
        toast.success('Audit cancelled.');
        refetch();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel audit.');
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Asset Audits"
        subtitle="Plan audit cycles, track physical verification lists, and compile inventory reports."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Audits' }]}
        action={
          <Button variant="primary" size="sm" onClick={openCreate} className="shadow-md shadow-primary/15">
            <Plus size={16} className="mr-1" /> Plan Audit
          </Button>
        }
      />

      {/* Filter Row */}
      <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-base-300/30">
          <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
            <Filter size={14} className="text-primary" /> Filter
          </h3>
          <button onClick={resetFilters} className="btn btn-ghost btn-xs text-xs text-base-content/50 hover:text-error normal-case flex items-center gap-1">
            <X size={12} /> Reset
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Status</label>
            <select value={filters.status} onChange={e => setFilters({ status: e.target.value })}
              className="select select-xs select-bordered text-xs rounded-lg w-full font-medium">
              <option value="">All Statuses</option>
              {['planned', 'in_progress', 'completed', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
          <span className="text-[10px] font-bold text-base-content/40 uppercase">{total} audit session{total !== 1 ? 's' : ''} found</span>
          <button onClick={refetch} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto w-full min-h-[280px]">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-full rounded-xl opacity-50" />
              ))}
            </div>
          ) : audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-base-200 rounded-2xl mb-3 text-base-content/30"><ClipboardCheck size={32} /></div>
              <p className="text-sm font-bold text-base-content/40">No audit sessions found</p>
              <p className="text-xs text-base-content/30 mt-1">Plan a verification session to verify physical inventory</p>
              <button onClick={openCreate} className="btn btn-primary btn-sm mt-4 normal-case text-xs font-semibold shadow-md shadow-primary/20">
                <Plus size={14} className="mr-1" /> Plan Audit
              </button>
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  <th>Audit Session</th>
                  <th>Type</th>
                  <th>Auditor</th>
                  <th>Schedule</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.map(a => {
                  const verified = parseInt(a.verified_assets, 10) || 0;
                  const totalCount = parseInt(a.total_assets, 10) || 0;
                  const percent = totalCount > 0 ? Math.round((verified / totalCount) * 100) : 0;

                  return (
                    <tr key={a.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                      <td>
                        <Link to={`/audits/${a.id}`} className="font-semibold text-base-content/85 hover:text-primary transition-colors">
                          {a.audit_name}
                        </Link>
                        <div className="font-mono text-[9px] text-primary">{a.audit_code}</div>
                      </td>
                      <td className="text-base-content/60 font-semibold uppercase">{a.audit_type}</td>
                      <td className="text-base-content/70 font-medium">{a.auditor_name}</td>
                      <td>
                        <div>Start: {formatDate(a.start_date)}</div>
                        {a.end_date && <div className="text-[10px] text-base-content/40">End: {formatDate(a.end_date)}</div>}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <progress className="progress progress-primary w-16 h-1.5" value={percent} max="100" />
                          <span className="text-[10px] font-bold text-base-content/60">{percent}%</span>
                        </div>
                        <div className="text-[9px] text-base-content/40 mt-0.5">{verified}/{totalCount} verified</div>
                      </td>
                      <td><AuditStatusBadge status={a.status} /></td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/audits/${a.id}`} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-primary" title="Details">
                            <Eye size={13} />
                          </Link>
                          {a.status === 'planned' && (
                            <>
                              <button onClick={() => handleStart(a.id, a.audit_code)} className="btn btn-ghost btn-xs btn-circle text-success" title="Start Audit">
                                <Play size={13} />
                              </button>
                              <button onClick={() => handleCancel(a.id, a.audit_code)} className="btn btn-ghost btn-xs btn-circle text-error" title="Cancel Audit">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                          {a.status === 'in_progress' && (
                            <button onClick={() => handleCancel(a.id, a.audit_code)} className="btn btn-ghost btn-xs btn-circle text-error" title="Cancel Audit">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && !isLoading && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-300/30">
            <span className="text-[10px] font-bold text-base-content/40 uppercase">Page {page} of {totalPages} — {total} total</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-outline btn-xs">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn btn-outline btn-xs">Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Create Audit Modal ── */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Plan Inventory Audit</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Audit Title *</label>
                <input type="text" placeholder="e.g. Q3 Physical Asset Verification" value={formName} onChange={e => setFormName(e.target.value)} required minLength={3} className="input input-sm input-bordered w-full text-xs" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Audit Type *</label>
                <select value={formType} onChange={e => setFormType(e.target.value as any)} className="select select-sm select-bordered w-full text-xs font-semibold">
                  <option value="full">Full Audit</option>
                  <option value="department">Department Audit</option>
                  <option value="location">Location Audit</option>
                  <option value="random">Random Verification</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Assign Auditor *</label>
                {isLoadingUsers ? (
                  <div className="skeleton h-8 w-full rounded-lg" />
                ) : (
                  <select value={formAuditorId} onChange={e => setFormAuditorId(e.target.value)} className="select select-sm select-bordered w-full text-xs font-semibold" required>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Start Date *</label>
                <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} required className="input input-sm input-bordered w-full text-xs" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Description</label>
                <textarea placeholder="Outline audit scope or notes..." value={formDesc} onChange={e => setFormDesc(e.target.value)} className="textarea textarea-sm textarea-bordered w-full text-xs h-16" />
              </div>

              <div className="modal-action gap-2 mt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button type="submit" disabled={isProcessing} className="btn btn-sm btn-primary text-white font-semibold px-5 normal-case text-xs">
                  {isProcessing ? 'Planning...' : 'Plan Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditsPage;
