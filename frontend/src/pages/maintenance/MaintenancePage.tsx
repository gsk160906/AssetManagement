import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Wrench, Plus, Eye, Pencil, Trash2, ChevronRight, Filter, X,
  RefreshCw, CheckCircle2, Clock, DollarSign
} from 'lucide-react';
import {
  createMaintenance, updateMaintenance, updateMaintenanceStatus, deleteMaintenance
} from '../../services/maintenanceService';
import { getAssets } from '../../services/assetService';
import { api } from '../../services/api';
import { useMaintenance } from '../../hooks/useMaintenance';

// ─── Priority Badge ───────────────────────────────────────────────────────────
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, string> = {
    LOW: 'badge-ghost text-base-content/60',
    MEDIUM: 'badge-info text-info-content',
    HIGH: 'badge-warning text-warning-content',
    CRITICAL: 'badge-error text-error-content'
  };
  return <span className={`badge badge-sm font-bold uppercase ${map[priority] ?? 'badge-ghost'}`}>{priority}</span>;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    PENDING: 'badge-warning text-warning-content',
    IN_PROGRESS: 'badge-info text-info-content',
    RESOLVED: 'badge-success text-success-content',
    CANCELLED: 'badge-error text-error-content'
  };
  return <span className={`badge badge-sm font-bold uppercase ${map[status] ?? 'badge-ghost'}`}>{status.replace(/_/g, ' ')}</span>;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-base-content/40 uppercase">{label}</p>
      <p className="text-xl font-extrabold text-base-content">{value}</p>
    </div>
  </div>
);

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: [],
  CANCELLED: []
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const MaintenancePage: React.FC = () => {
  const { tickets, stats, total, page, totalPages, isLoading, filters, setPage, setFilters, resetFilters, refetch, removeTicket, updateTicketInList } = useMaintenance();
  const [isProcessing, setIsProcessing] = useState(false);

  // Shared remote data
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  // Create form
  const [formAssetId, setFormAssetId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formEstCost, setFormEstCost] = useState('');

  // Edit form
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editEstCost, setEditEstCost] = useState('');
  const [editTechnicianId, setEditTechnicianId] = useState('');

  // Status form
  const [newStatus, setNewStatus] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Load assets and users for dropdowns
  const loadMeta = async () => {
    if (allAssets.length > 0) return; // already loaded
    setIsLoadingMeta(true);
    try {
      const [assetRes, userRes] = await Promise.all([
        getAssets({ limit: 500 }),
        api.get('/auth/users')
      ]);
      if (assetRes.success) {
        setAllAssets(assetRes.data.assets ?? []);
        if (assetRes.data.assets?.length > 0) setFormAssetId(assetRes.data.assets[0].id);
      }
      if (userRes.data.success) setAllUsers(userRes.data.data.users ?? []);
    } catch { /* silent — dropdowns will be empty */ }
    finally { setIsLoadingMeta(false); }
  };

  const openCreate = () => { loadMeta(); setFormDesc(''); setFormPriority('MEDIUM'); setFormEstCost(''); setIsCreateOpen(true); };

  const openEdit = (t: any) => {
    loadMeta();
    setSelected(t);
    setEditDesc(t.description);
    setEditPriority(t.priority);
    setEditEstCost(t.estimated_cost?.toString() ?? '');
    setEditTechnicianId(t.assigned_technician_id ?? '');
    setIsEditOpen(true);
  };

  const openStatus = (t: any) => {
    setSelected(t);
    const nextOptions = STATUS_FLOW[t.status] ?? [];
    setNewStatus(nextOptions[0] ?? '');
    setActualCost('');
    setStatusNotes('');
    setIsStatusOpen(true);
  };

  // ── Create ──
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssetId) return toast.error('Please select an asset');
    setIsProcessing(true);
    try {
      const res = await createMaintenance({
        assetId: formAssetId,
        description: formDesc,
        priority: formPriority,
        estimatedCost: formEstCost ? parseFloat(formEstCost) : 0
      });
      if (res.success) {
        toast.success('Maintenance ticket created!');
        setIsCreateOpen(false);
        refetch();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally { setIsProcessing(false); }
  };

  // ── Edit ──
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsProcessing(true);
    try {
      const res = await updateMaintenance(selected.id, {
        description: editDesc,
        priority: editPriority,
        estimatedCost: editEstCost ? parseFloat(editEstCost) : undefined,
        assignedTechnicianId: editTechnicianId || null
      });
      if (res.success) {
        toast.success('Ticket updated!');
        setIsEditOpen(false);
        updateTicketInList(selected.id, {
          description: editDesc,
          priority: editPriority,
          estimated_cost: editEstCost ? parseFloat(editEstCost) : selected.estimated_cost,
          assigned_technician_id: editTechnicianId || null,
          technician_name: allUsers.find(u => u.id === editTechnicianId)?.name ?? null
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setIsProcessing(false); }
  };

  // ── Status ──
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !newStatus) return;
    setIsProcessing(true);
    try {
      const res = await updateMaintenanceStatus(selected.id, {
        status: newStatus,
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        notes: statusNotes || undefined
      });
      if (res.success) {
        toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
        setIsStatusOpen(false);
        updateTicketInList(selected.id, {
          status: newStatus,
          actual_cost: actualCost ? parseFloat(actualCost) : selected.actual_cost,
          completed_date: newStatus === 'RESOLVED' ? new Date().toISOString() : selected.completed_date
        });
        refetch(); // refresh stats
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally { setIsProcessing(false); }
  };

  // ── Delete ──
  const handleDelete = async (t: any) => {
    if (!window.confirm(`Delete maintenance ticket for "${t.asset_name}"? This cannot be undone.`)) return;
    try {
      const res = await deleteMaintenance(t.id);
      if (res.success) {
        toast.success('Ticket deleted');
        removeTicket(t.id); // optimistic removal
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const formatCurrency = (v: any) =>
    v !== undefined && v !== null ? `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Maintenance & Repairs"
        subtitle="Track service requests, dispatch technicians, and monitor asset downtime."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Maintenance' }]}
        action={
          <Button variant="primary" size="sm" onClick={openCreate} className="shadow-md shadow-primary/15">
            <Plus size={16} className="mr-1" /> New Ticket
          </Button>
        }
      />

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pending" value={stats.pending} icon={<Clock size={18} />} color="bg-warning/10 text-warning" />
          <StatCard label="In Progress" value={stats.in_progress} icon={<Wrench size={18} />} color="bg-info/10 text-info" />
          <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 size={18} />} color="bg-success/10 text-success" />
          <StatCard label="Total Cost" value={formatCurrency(stats.total_actual_cost)} icon={<DollarSign size={18} />} color="bg-primary/10 text-primary" />
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-base-300/30">
          <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
            <Filter size={14} className="text-primary" /> Filters
          </h3>
          <button onClick={resetFilters} className="btn btn-ghost btn-xs text-xs text-base-content/50 hover:text-error normal-case flex items-center gap-1">
            <X size={12} /> Reset
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Search</label>
            <input type="text" placeholder="Asset name, tag, technician..." value={filters.q}
              onChange={e => setFilters({ q: e.target.value })}
              className="input input-xs input-bordered text-xs rounded-lg w-full" />
          </div>
          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Priority</label>
            <select value={filters.priority} onChange={e => setFilters({ priority: e.target.value })}
              className="select select-xs select-bordered text-xs rounded-lg w-full font-medium">
              <option value="">All Priorities</option>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Status</label>
            <select value={filters.status} onChange={e => setFilters({ status: e.target.value })}
              className="select select-xs select-bordered text-xs rounded-lg w-full font-medium">
              <option value="">All Statuses</option>
              {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
          <span className="text-[10px] font-bold text-base-content/40 uppercase">{total} ticket{total !== 1 ? 's' : ''}</span>
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
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-base-200 rounded-2xl mb-3 text-base-content/30"><Wrench size={32} /></div>
              <p className="text-sm font-bold text-base-content/40">No maintenance tickets found</p>
              <p className="text-xs text-base-content/30 mt-1">Create your first ticket to get started</p>
              <button onClick={openCreate} className="btn btn-primary btn-sm mt-4 normal-case text-xs font-semibold shadow-md shadow-primary/20">
                <Plus size={14} className="mr-1" /> Create Ticket
              </button>
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Est. Cost</th>
                  <th>Actual Cost</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                    <td>
                      <Link to={`/maintenance/${t.id}`} className="font-semibold text-base-content/85 hover:text-primary transition-colors">
                        {t.asset_name}
                      </Link>
                      <div className="font-mono text-[9px] text-primary">{t.asset_tag}</div>
                    </td>
                    <td className="text-base-content/60">{t.category_name ?? '—'}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-base-content/70">
                      {t.technician_name ?? <span className="text-base-content/30 italic text-[10px]">Unassigned</span>}
                    </td>
                    <td>{formatCurrency(t.estimated_cost)}</td>
                    <td>{formatCurrency(t.actual_cost)}</td>
                    <td>{formatDate(t.created_at)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/maintenance/${t.id}`} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-primary" title="View Details">
                          <Eye size={13} />
                        </Link>
                        {!['RESOLVED', 'CANCELLED'].includes(t.status) && (
                          <>
                            <button onClick={() => openEdit(t)} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-warning" title="Edit">
                              <Pencil size={13} />
                            </button>
                            {(STATUS_FLOW[t.status]?.length ?? 0) > 0 && (
                              <button onClick={() => openStatus(t)} className="btn btn-ghost btn-xs text-info font-semibold px-2 normal-case flex items-center gap-0.5">
                                <ChevronRight size={13} /> Status
                              </button>
                            )}
                          </>
                        )}
                        {t.status === 'PENDING' && (
                          <button onClick={() => handleDelete(t)} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-error" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* ── Create Modal ── */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Raise Maintenance Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Asset *</label>
                {isLoadingMeta ? (
                  <div className="skeleton h-8 w-full rounded-lg" />
                ) : (
                  <select value={formAssetId} onChange={e => setFormAssetId(e.target.value)}
                    className="select select-sm select-bordered w-full text-xs font-semibold" required>
                    {allAssets.length === 0
                      ? <option value="">No assets available</option>
                      : allAssets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.assetTag ?? a.asset_tag})</option>)
                    }
                  </select>
                )}
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Priority *</label>
                <select value={formPriority} onChange={e => setFormPriority(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Description * <span className="text-base-content/30">(min 10 chars)</span></label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
                  placeholder="Describe the issue in detail..." minLength={10} required
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-20" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Estimated Cost ($)</label>
                <input type="number" min="0" step="0.01" value={formEstCost}
                  onChange={e => setFormEstCost(e.target.value)} placeholder="0.00"
                  className="input input-sm input-bordered w-full text-xs" />
              </div>
              <div className="modal-action gap-2 mt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button type="submit" disabled={isProcessing} className="btn btn-sm btn-primary text-white font-semibold px-5 normal-case text-xs">
                  {isProcessing ? 'Submitting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditOpen && selected && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-1">Edit Ticket</h3>
            <p className="text-xs text-base-content/40 mb-4">{selected.asset_name} · <span className="font-mono">{selected.asset_tag}</span></p>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Priority</label>
                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Assign Technician</label>
                {isLoadingMeta ? (
                  <div className="skeleton h-8 w-full rounded-lg" />
                ) : (
                  <select value={editTechnicianId} onChange={e => setEditTechnicianId(e.target.value)}
                    className="select select-sm select-bordered w-full text-xs font-semibold">
                    <option value="">— Unassigned —</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                )}
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} minLength={10}
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-20" />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Estimated Cost ($)</label>
                <input type="number" min="0" step="0.01" value={editEstCost}
                  onChange={e => setEditEstCost(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs" />
              </div>
              <div className="modal-action gap-2 mt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button type="submit" disabled={isProcessing} className="btn btn-sm btn-warning text-white font-semibold px-5 normal-case text-xs">
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status Modal ── */}
      {isStatusOpen && selected && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Update Ticket Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="text-xs bg-base-200/50 p-3 rounded-xl border border-base-300/30 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/50">Asset:</span>
                  <span className="font-semibold">{selected.asset_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/50">Current Status:</span>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Transition To *</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold" required>
                  <option value="">Select next status...</option>
                  {(STATUS_FLOW[selected.status] ?? []).map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              {newStatus === 'RESOLVED' && (
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Actual Cost ($)</label>
                  <input type="number" min="0" step="0.01" value={actualCost}
                    onChange={e => setActualCost(e.target.value)} placeholder="0.00"
                    className="input input-sm input-bordered w-full text-xs" />
                </div>
              )}
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Notes</label>
                <textarea value={statusNotes} onChange={e => setStatusNotes(e.target.value)}
                  placeholder="Optional resolution notes..."
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-16" />
              </div>
              <div className="modal-action gap-2 mt-4">
                <button type="button" onClick={() => setIsStatusOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button type="submit" disabled={isProcessing || !newStatus}
                  className="btn btn-sm btn-info text-white font-semibold px-5 normal-case text-xs">
                  {isProcessing ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
