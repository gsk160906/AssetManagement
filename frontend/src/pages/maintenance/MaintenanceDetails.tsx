import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Wrench, ArrowLeft, Pencil, ChevronRight, Trash2, User, Calendar,
  DollarSign, Tag, Building2, Package, AlertCircle, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { getMaintenanceById, updateMaintenance, updateMaintenanceStatus, deleteMaintenance } from '../../services/maintenanceService';
import { api } from '../../services/api';
import { PriorityBadge, StatusBadge } from './MaintenancePage';

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: [],
  CANCELLED: []
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-base-300/20 last:border-0">
    {icon && <div className="text-base-content/30 mt-0.5 shrink-0">{icon}</div>}
    <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
      <span className="text-[10px] font-bold text-base-content/40 uppercase">{label}</span>
      <span className="text-xs font-semibold text-base-content/80">{value}</span>
    </div>
  </div>
);

export const MaintenanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editEstCost, setEditEstCost] = useState('');
  const [editTechnicianId, setEditTechnicianId] = useState('');

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const [allUsers, setAllUsers] = useState<any[]>([]);

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMaintenanceById(id);
      if (res.success) {
        setTicket(res.data);
      } else {
        setError(res.message || 'Ticket not found');
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Maintenance ticket not found.' : err.response?.data?.message || 'Unable to load ticket.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchUsers = async () => {
    if (allUsers.length > 0) return;
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) setAllUsers(res.data.data.users ?? []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const openEdit = () => {
    if (!ticket) return;
    fetchUsers();
    setEditDesc(ticket.description);
    setEditPriority(ticket.priority);
    setEditEstCost(ticket.estimated_cost?.toString() ?? '');
    setEditTechnicianId(ticket.assigned_technician_id ?? '');
    setIsEditOpen(true);
  };

  const openStatus = () => {
    if (!ticket) return;
    const nextOptions = STATUS_FLOW[ticket.status] ?? [];
    setNewStatus(nextOptions[0] ?? '');
    setActualCost('');
    setStatusNotes('');
    setIsStatusOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await updateMaintenance(id!, {
        description: editDesc,
        priority: editPriority,
        estimatedCost: editEstCost ? parseFloat(editEstCost) : undefined,
        assignedTechnicianId: editTechnicianId || null
      });
      if (res.success) {
        toast.success('Ticket updated!');
        setIsEditOpen(false);
        fetchTicket();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setIsProcessing(false); }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;
    setIsProcessing(true);
    try {
      const res = await updateMaintenanceStatus(id!, {
        status: newStatus,
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        notes: statusNotes || undefined
      });
      if (res.success) {
        toast.success(`Status → ${newStatus.replace(/_/g, ' ')}`);
        setIsStatusOpen(false);
        fetchTicket();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally { setIsProcessing(false); }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    if (!window.confirm(`Delete maintenance ticket for "${ticket.asset_name}"?`)) return;
    try {
      const res = await deleteMaintenance(id!);
      if (res.success) { toast.success('Ticket deleted'); navigate('/maintenance'); }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCur = (v: any) =>
    v !== undefined && v !== null ? `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-24 w-full rounded-2xl" />
            <div className="skeleton h-48 w-full rounded-2xl" />
          </div>
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="p-4 bg-error/10 text-error rounded-2xl"><AlertCircle size={40} /></div>
        <h2 className="text-lg font-bold text-base-content">{error}</h2>
        <Link to="/maintenance" className="btn btn-primary btn-sm normal-case font-semibold text-xs">
          <ArrowLeft size={14} className="mr-1" /> Back to Maintenance
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const canEdit   = !['RESOLVED', 'CANCELLED'].includes(ticket.status);
  const canStatus = (STATUS_FLOW[ticket.status]?.length ?? 0) > 0;
  const canDelete = ticket.status === 'PENDING';

  const statusIcon: Record<string, React.ReactNode> = {
    PENDING: <Clock size={16} className="text-warning" />,
    IN_PROGRESS: <Wrench size={16} className="text-info" />,
    RESOLVED: <CheckCircle2 size={16} className="text-success" />,
    CANCELLED: <XCircle size={16} className="text-error" />
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Maintenance Ticket"
        subtitle={`${ticket.asset_name} · ${ticket.asset_tag}`}
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Maintenance', path: '/maintenance' },
          { label: ticket.asset_tag }
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={openEdit}>
                <Pencil size={13} className="mr-1" /> Edit
              </Button>
            )}
            {canStatus && (
              <Button variant="primary" size="sm" onClick={openStatus}>
                <ChevronRight size={13} className="mr-0.5" /> Update Status
              </Button>
            )}
            {canDelete && (
              <Button variant="error" size="sm" onClick={handleDelete}>
                <Trash2 size={13} className="mr-1" /> Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left (main) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status banner */}
          <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-base-200 rounded-xl">{statusIcon[ticket.status]}</div>
                <div>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Status</p>
                  <div className="mt-0.5"><StatusBadge status={ticket.status} /></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-base-200 rounded-xl"><Tag size={16} className="text-base-content/50" /></div>
                <div>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Priority</p>
                  <div className="mt-0.5"><PriorityBadge priority={ticket.priority} /></div>
                </div>
              </div>
              {ticket.completed_date && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-success/10 rounded-xl"><CheckCircle2 size={16} className="text-success" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase">Completed</p>
                    <p className="text-xs font-bold text-success">{fmt(ticket.completed_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <Card title="Issue Description">
            <p className="text-sm leading-relaxed text-base-content/70 whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          {/* Ticket details */}
          <Card title="Ticket Information">
            <InfoRow label="Ticket ID" value={<span className="font-mono text-[11px] text-primary break-all">{ticket.id}</span>} icon={<Tag size={13} />} />
            <InfoRow label="Raised By" value={ticket.raised_by_name} icon={<User size={13} />} />
            <InfoRow label="Raised On" value={fmt(ticket.created_at)} icon={<Calendar size={13} />} />
            <InfoRow label="Last Updated" value={fmt(ticket.updated_at)} icon={<Calendar size={13} />} />
            <InfoRow label="Est. Cost" value={fmtCur(ticket.estimated_cost)} icon={<DollarSign size={13} />} />
            <InfoRow label="Actual Cost" value={
              <span className={parseFloat(ticket.actual_cost) > 0 ? 'text-success font-bold' : 'text-base-content/40'}>
                {fmtCur(ticket.actual_cost)}
              </span>
            } icon={<DollarSign size={13} />} />
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Asset */}
          <Card title="Asset">
            <p className="font-bold text-sm text-base-content/85">{ticket.asset_name}</p>
            <p className="font-mono text-xs text-primary font-bold">{ticket.asset_tag}</p>
            <p className="text-xs text-base-content/40 mt-1">S/N: {ticket.serial_number ?? '—'}</p>
            <div className="mt-3 space-y-1">
              <InfoRow label="Category" value={ticket.category_name ?? '—'} icon={<Package size={12} />} />
              <InfoRow label="Department" value={ticket.department_name ?? 'N/A'} icon={<Building2 size={12} />} />
              <InfoRow label="Asset Status" value={<span className="badge badge-xs font-bold uppercase">{ticket.asset_status}</span>} />
            </div>
            <Link to={`/assets/${ticket.raw_asset_id ?? ticket.asset_id}`}
              className="btn btn-outline btn-xs w-full rounded-xl normal-case text-xs font-semibold mt-4">
              View Asset →
            </Link>
          </Card>

          {/* Technician */}
          <Card title="Technician">
            {ticket.technician_name ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {ticket.technician_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-base-content/85">{ticket.technician_name}</p>
                  <p className="text-[10px] text-base-content/40">{ticket.technician_email}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="p-3 bg-base-200 rounded-xl inline-block mb-2 text-base-content/30"><User size={18} /></div>
                <p className="text-xs text-base-content/40">No technician assigned</p>
                {canEdit && (
                  <button onClick={openEdit} className="btn btn-ghost btn-xs text-primary normal-case text-xs mt-2">
                    Assign Technician
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Cost */}
          <Card title="Cost Summary">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-base-content/50">Estimated</span>
                <span className="text-sm font-bold">{fmtCur(ticket.estimated_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-base-content/50">Actual</span>
                <span className={`text-sm font-bold ${parseFloat(ticket.actual_cost) > 0 ? 'text-success' : 'text-base-content/30'}`}>
                  {fmtCur(ticket.actual_cost)}
                </span>
              </div>
              {parseFloat(ticket.actual_cost) > 0 && parseFloat(ticket.estimated_cost) > 0 && (
                <div className="pt-2 border-t border-base-300/30 flex justify-between">
                  <span className="text-xs text-base-content/50">Variance</span>
                  <span className={`text-xs font-bold ${parseFloat(ticket.actual_cost) > parseFloat(ticket.estimated_cost) ? 'text-error' : 'text-success'}`}>
                    {fmtCur(Math.abs(parseFloat(ticket.actual_cost) - parseFloat(ticket.estimated_cost)))}
                    {parseFloat(ticket.actual_cost) > parseFloat(ticket.estimated_cost) ? ' over budget' : ' under budget'}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {isEditOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Edit Ticket</h3>
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
                <select value={editTechnicianId} onChange={e => setEditTechnicianId(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold">
                  <option value="">— Unassigned —</option>
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
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
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isProcessing} disabled={isProcessing}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Status Modal ── */}
      {isStatusOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-4">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="bg-base-200/50 p-3 rounded-xl border border-base-300/30 text-xs flex justify-between">
                <span className="text-base-content/50">Current:</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Transition To *</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold" required>
                  <option value="">Select next status...</option>
                  {(STATUS_FLOW[ticket.status] ?? []).map(s => (
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
                  placeholder="Optional notes..."
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-16" />
              </div>
              <div className="modal-action gap-2 mt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsStatusOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={isProcessing || !newStatus} isLoading={isProcessing}>
                  Confirm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDetails;
