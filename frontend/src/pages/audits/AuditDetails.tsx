import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, CheckCircle2, RefreshCw,
  Search, CheckSquare, AlertCircle, BarChart3
} from 'lucide-react';
import {
  getAuditById, getAuditProgress, getAuditItemsList, verifyAsset, bulkVerifyAssets, completeAudit
} from '../../services/auditService';

// ─── Verification Item Badge ──────────────────────────────────────────────────
export const VerificationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'badge-ghost text-base-content/50',
    verified: 'badge-success text-success-content',
    missing: 'badge-error text-error-content',
    damaged: 'badge-warning text-warning-content',
    relocated: 'badge-info text-info-content',
    not_found: 'badge-error text-error-content'
  };
  return (
    <span className={`badge badge-sm font-bold uppercase ${map[status] ?? 'badge-ghost'}`}>
      {status}
    </span>
  );
};

export const AuditDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [audit, setAudit] = useState<any | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk operation selection state
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Verification dialog states
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [formStatus, setFormStatus] = useState<'verified' | 'missing' | 'damaged' | 'relocated' | 'not_found'>('verified');
  const [formActualLoc, setFormActualLoc] = useState('');
  const [formRemarks, setFormRemarks] = useState('');

  // Load audit data concurrently
  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [auditRes, progressRes, itemsRes] = await Promise.all([
        getAuditById(id),
        getAuditProgress(id),
        getAuditItemsList(id, { status: statusFilter, q: searchQuery })
      ]);
      if (auditRes.success) setAudit(auditRes.data.audit);
      if (progressRes.success) setProgress(progressRes.data);
      if (itemsRes.success) setItems(itemsRes.data.items ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit session details.');
    } finally {
      setIsLoading(false);
    }
  }, [id, statusFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bulk Checkbox handlers
  const handleToggleSelect = (assetId: string) => {
    setSelectedAssetIds(prev =>
      prev.includes(assetId) ? prev.filter(x => x !== assetId) : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    const pendingItems = items.filter(i => i.verification_status === 'pending');
    if (selectedAssetIds.length === pendingItems.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(pendingItems.map(i => i.asset_id));
    }
  };

  // Submit Single Verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setIsProcessing(true);
    try {
      const res = await verifyAsset(id!, selectedAsset.asset_id, {
        verification_status: formStatus,
        actual_location: formActualLoc || null,
        remarks: formRemarks || null
      });
      if (res.success) {
        toast.success('Asset verified successfully.');
        setIsVerifyOpen(false);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification update failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Bulk Verification
  const handleBulkVerify = async () => {
    if (selectedAssetIds.length === 0) return;
    if (!window.confirm(`Mark ${selectedAssetIds.length} selected assets as VERIFIED?`)) return;
    setIsProcessing(true);
    try {
      const payload = selectedAssetIds.map(assetId => {
        const item = items.find(i => i.asset_id === assetId);
        return {
          id: assetId,
          status: 'verified',
          actual_location: item?.expected_location || null,
          remarks: 'Bulk verified'
        };
      });
      const res = await bulkVerifyAssets(id!, payload);
      if (res.success) {
        toast.success(`Successfully verified ${selectedAssetIds.length} assets!`);
        setSelectedAssetIds([]);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Complete session trigger
  const handleComplete = async () => {
    if (progress?.pending > 0) {
      return toast.error(`Cannot complete audit. ${progress.pending} pending items remain.`);
    }
    if (!window.confirm('Complete this audit session? This will finalize results and calculate accuracy ratings.')) return;
    setIsProcessing(true);
    try {
      const res = await completeAudit(id!);
      if (res.success) {
        toast.success('Audit session completed!');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete audit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openSingleVerify = (item: any) => {
    setSelectedAsset(item);
    setFormStatus('verified');
    setFormActualLoc(item.expected_location || '');
    setFormRemarks('');
    setIsVerifyOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="p-4 bg-error/10 text-error rounded-2xl"><AlertCircle size={40} /></div>
        <h2 className="text-lg font-bold text-base-content">{error}</h2>
        <Link to="/audits" className="btn btn-primary btn-sm normal-case font-semibold text-xs">
          <ArrowLeft size={14} className="mr-1" /> Back to Audits
        </Link>
      </div>
    );
  }

  if (!audit) return null;

  const isActive = audit.status === 'in_progress';
  const pendingCount = progress?.pending || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Audit Session Details"
        subtitle={`${audit.audit_name} · ${audit.audit_code}`}
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Audits', path: '/audits' },
          { label: audit.audit_code }
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/audits')}>
              <ArrowLeft size={13} className="mr-1" /> Back
            </Button>
            {isActive && pendingCount === 0 && (
              <Button variant="primary" size="sm" onClick={handleComplete} disabled={isProcessing}>
                <CheckCircle2 size={13} className="mr-1" /> Complete Audit
              </Button>
            )}
            {audit.status === 'completed' && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/audits/${id}/report`)}>
                <BarChart3 size={13} className="mr-1" /> View Accuracy Report
              </Button>
            )}
          </div>
        }
      />

      {/* Progress Cards */}
      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          <div className="card bg-base-100/40 border border-base-300/40 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-base-content/40 uppercase">Total Assets</span>
            <span className="text-lg font-extrabold mt-1 text-base-content">{progress.total}</span>
          </div>
          <div className="card bg-success/5 border border-success/15 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-success/60 uppercase">Verified</span>
            <span className="text-lg font-extrabold mt-1 text-success">{progress.verified}</span>
          </div>
          <div className="card bg-error/5 border border-error/15 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-error/60 uppercase">Missing</span>
            <span className="text-lg font-extrabold mt-1 text-error">{progress.missing}</span>
          </div>
          <div className="card bg-warning/5 border border-warning/15 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-warning/60 uppercase">Damaged</span>
            <span className="text-lg font-extrabold mt-1 text-warning">{progress.damaged}</span>
          </div>
          <div className="card bg-info/5 border border-info/15 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-info/60 uppercase">Relocated</span>
            <span className="text-lg font-extrabold mt-1 text-info">{progress.relocated}</span>
          </div>
          <div className="card bg-neutral/10 border border-base-300 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-base-content/40 uppercase">Pending</span>
            <span className="text-lg font-extrabold mt-1 text-base-content/60">{progress.pending}</span>
          </div>
          <div className="card bg-primary/10 border border-primary/20 rounded-xl p-3 flex flex-col justify-between col-span-2 md:col-span-1">
            <span className="text-[9px] font-bold text-primary uppercase">Progress</span>
            <span className="text-lg font-extrabold mt-1 text-primary">{progress.percentage}%</span>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1">
          {['', 'pending', 'verified', 'missing', 'damaged', 'relocated', 'not_found'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-xs rounded-xl normal-case px-3 ${statusFilter === status ? 'btn-primary text-white' : 'btn-ghost text-base-content/60'}`}
            >
              {status === '' ? 'All Items' : status.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search asset, code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input input-xs input-bordered text-xs rounded-xl w-full pl-8"
          />
          <Search size={12} className="absolute left-2.5 top-2.5 text-base-content/40" />
        </div>
      </div>

      {/* Verification Table */}
      <Card>
        <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-base-content/40 uppercase">{items.length} items found</span>
            {isActive && selectedAssetIds.length > 0 && (
              <button onClick={handleBulkVerify} className="btn btn-xs btn-success text-white normal-case flex items-center gap-1 shadow-sm">
                <CheckSquare size={12} /> Verify Selected ({selectedAssetIds.length})
              </button>
            )}
          </div>
          <button onClick={loadData} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          {items.length === 0 ? (
            <div className="text-center py-16 text-xs text-base-content/30 italic">
              No verification items found matching filter criteria.
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  {isActive && (
                    <th className="w-8">
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.length === items.filter(i => i.verification_status === 'pending').length && items.length > 0}
                        onChange={handleSelectAll}
                        className="checkbox checkbox-xs checkbox-primary"
                      />
                    </th>
                  )}
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Expected Location</th>
                  <th>Actual Location</th>
                  <th>Status</th>
                  <th>Verified By</th>
                  {isActive && <th className="text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                    {isActive && (
                      <td>
                        {item.verification_status === 'pending' ? (
                          <input
                            type="checkbox"
                            checked={selectedAssetIds.includes(item.asset_id)}
                            onChange={() => handleToggleSelect(item.asset_id)}
                            className="checkbox checkbox-xs checkbox-primary"
                          />
                        ) : (
                          <span className="text-success select-none">✓</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className="font-bold text-base-content/85">{item.asset_name}</span>
                      <div className="font-mono text-[9px] text-primary">{item.asset_tag}</div>
                    </td>
                    <td className="text-base-content/60">{item.category_name ?? '—'}</td>
                    <td className="text-base-content/60 font-semibold">{item.expected_location}</td>
                    <td className="text-base-content/70 font-semibold">{item.actual_location ?? '—'}</td>
                    <td><VerificationStatusBadge status={item.verification_status} /></td>
                    <td>
                      {item.verified_by_name ? (
                        <div>
                          <div className="font-semibold">{item.verified_by_name}</div>
                          {item.verified_at && <div className="text-[9px] text-base-content/40">{new Date(item.verified_at).toLocaleString()}</div>}
                        </div>
                      ) : (
                        <span className="text-base-content/30 italic text-[10px]">Unverified</span>
                      )}
                    </td>
                    {isActive && (
                      <td className="text-right">
                        {item.verification_status === 'pending' ? (
                          <button onClick={() => openSingleVerify(item)} className="btn btn-ghost btn-xs text-primary font-semibold normal-case px-2">
                            Verify
                          </button>
                        ) : (
                          <button onClick={() => openSingleVerify(item)} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary font-semibold normal-case px-2">
                            Change
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* ── Single Verify Modal ── */}
      {isVerifyOpen && selectedAsset && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm mb-1">Verify Asset</h3>
            <p className="text-xs text-base-content/40 mb-4">{selectedAsset.asset_name} · <span className="font-mono">{selectedAsset.asset_tag}</span></p>
            
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Verification Status *</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="select select-sm select-bordered w-full text-xs font-semibold">
                  <option value="verified">Verified (Location Correct)</option>
                  <option value="relocated">Relocated (Found elsewhere)</option>
                  <option value="damaged">Damaged</option>
                  <option value="missing">Missing</option>
                  <option value="not_found">Not Found</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Expected Location</label>
                <div className="alert alert-xs bg-base-200/50 border-0 rounded-lg text-base-content/60 p-2 font-mono text-xs">{selectedAsset.expected_location}</div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Actual Location *</label>
                <input
                  type="text"
                  value={formActualLoc}
                  onChange={e => setFormActualLoc(e.target.value)}
                  placeholder="Record physical room or desk..."
                  required
                  className="input input-sm input-bordered w-full text-xs font-semibold"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Audit Remarks</label>
                <textarea
                  placeholder="Optional remarks (e.g. slight scratch)..."
                  value={formRemarks}
                  onChange={e => setFormRemarks(e.target.value)}
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-16"
                />
              </div>

              <div className="modal-action gap-2 mt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsVerifyOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isProcessing} disabled={isProcessing}>
                  Save Verification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDetails;
