import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Plus, Eye, Key, ArrowLeftRight, Undo2, Filter, X, ArrowLeft, Calendar, FileText, User, RefreshCw } from 'lucide-react';
import { getAllocations, allocateAsset, returnAsset, transferAsset } from '../../services/allocationService';
import { getAssets } from '../../services/assetService';

export const AllocationsPage: React.FC = () => {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Available assets for checkout dropdown
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    departmentId: '',
    categoryId: ''
  });

  // Selected row for actions
  const [selectedAlloc, setSelectedAlloc] = useState<any | null>(null);

  // Drawer / Modal states
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Allocation Form State
  const [formAssetId, setFormAssetId] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('e1000000-0000-0000-0000-000000000002'); // Sarah Jenkins
  const [formExpectedReturn, setFormExpectedReturn] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Transfer Form State
  const [transferEmployeeId, setTransferEmployeeId] = useState('e1000000-0000-0000-0000-000000000004'); // Michael Chang
  const [transferNotes, setTransferNotes] = useState('');

  // Return Form State
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');

  const mockEmployees = [
    { id: 'e1000000-0000-0000-0000-000000000001', name: 'David Smith (IT)' },
    { id: 'e1000000-0000-0000-0000-000000000002', name: 'Sarah Jenkins (IT)' },
    { id: 'e1000000-0000-0000-0000-000000000003', name: 'Emma Watson (HR)' },
    { id: 'e1000000-0000-0000-0000-000000000004', name: 'Michael Chang (HR)' },
    { id: 'e1000000-0000-0000-0000-000000000005', name: 'Olivia Davis (HR)' },
    { id: 'e1000000-0000-0000-0000-000000000006', name: 'James Wilson (Finance)' },
    { id: 'e1000000-0000-0000-0000-000000000007', name: 'Robert Miller (Finance)' },
    { id: 'e1000000-0000-0000-0000-000000000008', name: 'Sophia Taylor (Finance)' },
    { id: 'e1000000-0000-0000-0000-000000000009', name: 'William Brown (Unassigned)' },
    { id: 'e1000000-0000-0000-0000-000000000010', name: 'Linda Martinez (Unassigned)' }
  ];

  // Seeded list of categories
  const mockCategories = [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'Computing Hardware' },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'Mobile Devices' },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'AV Equipment' },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Office Furniture' },
    { id: 'c1000000-0000-0000-0000-000000000005', name: 'Company Vehicles' }
  ];

  // Seeded list of departments
  const mockDepartments = [
    { id: 'd1000000-0000-0000-0000-000000000001', name: 'Information Technology' },
    { id: 'd1000000-0000-0000-0000-000000000002', name: 'Human Resources' },
    { id: 'd1000000-0000-0000-0000-000000000003', name: 'Finance' }
  ];

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const res = await getAllocations({
        ...filters,
        page,
        limit
      });
      if (res.success) {
        setAllocations(res.data.allocations);
        setTotal(res.data.total);
      }
    } catch (err: any) {
      toast.error('Failed to load custody allocations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await getAssets({ status: 'AVAILABLE', limit: 100 });
      if (res.success) {
        setAvailableAssets(res.data.assets);
        if (res.data.assets.length > 0) {
          setFormAssetId(res.data.assets[0].id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to fetch available assets');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, JSON.stringify(filters)]);

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      q: '',
      status: '',
      departmentId: '',
      categoryId: ''
    });
    setPage(1);
  };

  const handleOpenAlloc = () => {
    fetchAvailableAssets();
    setIsAllocModalOpen(true);
  };

  // Submit allocation handout
  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssetId) return toast.error('Please select an available asset');
    
    setIsProcessing(true);
    try {
      const res = await allocateAsset({
        assetId: formAssetId,
        employeeId: formEmployeeId,
        expectedReturnDate: formExpectedReturn || undefined,
        notes: formNotes || undefined
      });
      if (res.success) {
        toast.success('Asset allocated successfully!');
        setIsAllocModalOpen(false);
        setFormNotes('');
        setFormExpectedReturn('');
        fetchAllocations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Return Check-in
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlloc) return;
    setIsProcessing(true);
    try {
      const res = await returnAsset(selectedAlloc.id, {
        conditionAfter: returnCondition,
        notes: returnNotes
      });
      if (res.success) {
        toast.success('Asset returned successfully!');
        setIsReturnModalOpen(false);
        setReturnNotes('');
        fetchAllocations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to return asset');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Custodian Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlloc) return;
    setIsProcessing(true);
    try {
      const res = await transferAsset({
        assetId: selectedAlloc.asset_id,
        newEmployeeId: transferEmployeeId,
        notes: transferNotes
      });
      if (res.success) {
        toast.success('Transfer completed successfully!');
        setIsTransferModalOpen(false);
        setTransferNotes('');
        fetchAllocations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'badge-info text-info-content';
      case 'RETURNED': return 'badge-success text-success-content';
      case 'TRANSFERRED': return 'badge-warning text-warning-content';
      default: return 'badge-ghost';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (allocatedDate: string) => {
    const allocated = new Date(allocatedDate);
    const today = new Date();
    const diffTime = today.getTime() - allocated.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in pb-20 relative">
      <PageHeader
        title="Custody Allocations"
        subtitle="Manage resource assignments, track return schedules, and process reassignments."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Allocations' }]}
        action={
          <Button variant="primary" size="sm" onClick={handleOpenAlloc} className="shadow-md shadow-primary/15">
            <Plus size={16} className="mr-1" />
            Allocate Asset
          </Button>
        }
      />

      {/* Advanced Filters */}
      <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-base-300/30">
          <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
            <Filter size={14} className="text-primary" />
            Filters
          </h3>
          <button onClick={handleResetFilters} className="btn btn-ghost btn-xs text-xs text-base-content/50 hover:text-error flex items-center gap-1 normal-case">
            <X size={12} />
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Search Keywords</label>
            <input
              type="text"
              placeholder="Asset, Employee..."
              value={filters.q}
              onChange={(e) => handleFilterChange({ q: e.target.value })}
              className="input input-xs input-bordered text-xs rounded-lg w-full"
            />
          </div>

          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
            >
              <option value="">All Allocations</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RETURNED">RETURNED</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Department</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange({ departmentId: e.target.value })}
              className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
            >
              <option value="">All Departments</option>
              {mockDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label text-[10px] font-semibold text-base-content/50 p-1">Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange({ categoryId: e.target.value })}
              className="select select-xs select-bordered text-xs rounded-lg w-full font-medium"
            >
              <option value="">All Categories</option>
              {mockCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <Card>
        <div className="overflow-x-auto w-full min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : allocations.length === 0 ? (
            <div className="text-center py-16 text-base-content/40 text-xs font-semibold">
              No allocations recorded matching search filters.
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Allocated Date</th>
                  <th>Expected Return</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                    <td>
                      <div className="font-semibold text-base-content/85 whitespace-nowrap">{alloc.asset_name}</div>
                      <div className="font-mono text-[9px] text-primary">{alloc.asset_tag}</div>
                    </td>
                    <td className="font-semibold whitespace-nowrap">{alloc.employee_name}</td>
                    <td className="text-base-content/60">{alloc.department_name || 'Unassigned'}</td>
                    <td>{formatDate(alloc.allocated_date)}</td>
                    <td>{formatDate(alloc.expected_return_date)}</td>
                    <td>
                      <span className={`badge badge-sm font-bold uppercase ${getStatusBadge(alloc.status)}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="text-right flex items-center justify-end gap-1.5 h-full py-2">
                      <button
                        onClick={() => {
                          setSelectedAlloc(alloc);
                          setIsDrawerOpen(true);
                        }}
                        className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-primary"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>

                      {alloc.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAlloc(alloc);
                              setIsReturnModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs text-success font-semibold px-2 normal-case"
                          >
                            <Undo2 size={12} className="mr-0.5" />
                            Return
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAlloc(alloc);
                              setIsTransferModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs text-warning font-semibold px-2 normal-case"
                          >
                            <ArrowLeftRight size={12} className="mr-0.5" />
                            Transfer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && !isLoading && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-300/30">
            <span className="text-[10px] font-bold text-base-content/40 uppercase">Total Items: {total}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline btn-xs"
              >
                Previous
              </button>
              <span className="text-xs font-bold px-3">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline btn-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 1. Allocate Asset Form Modal */}
      {isAllocModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm text-base-content mb-4">Allocate Asset Handout</h3>
            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Select Asset (AVAILABLE Only) *</label>
                {isLoadingAssets ? (
                  <span className="loading loading-spinner loading-xs text-primary"></span>
                ) : availableAssets.length === 0 ? (
                  <span className="text-xs text-error font-semibold">No assets currently available.</span>
                ) : (
                  <select
                    value={formAssetId}
                    onChange={(e) => setFormAssetId(e.target.value)}
                    className="select select-sm select-bordered w-full text-xs font-semibold"
                    required
                  >
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Assign Employee *</label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold"
                  required
                >
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Expected Return Date</label>
                <input
                  type="date"
                  value={formExpectedReturn}
                  onChange={(e) => setFormExpectedReturn(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Notes</label>
                <textarea
                  placeholder="Additional setup details or instructions"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-16"
                ></textarea>
              </div>

              <div className="modal-action gap-2 mt-6">
                <button type="button" onClick={() => setIsAllocModalOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button
                  type="submit"
                  disabled={isProcessing || availableAssets.length === 0}
                  className="btn btn-sm btn-primary text-white font-semibold shadow-md shadow-primary/20 px-5 normal-case text-xs"
                >
                  {isProcessing ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Transfer Custodian Dialog */}
      {isTransferModalOpen && selectedAlloc && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm text-base-content mb-3">Reassign Custodian</h3>
            <p className="text-[11px] text-base-content/50 leading-relaxed mb-4">
              Transferring <strong>{selectedAlloc.asset_name}</strong> will close the current active allocation to <strong>{selectedAlloc.employee_name}</strong> and spawn a new one.
            </p>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Current Custodian</label>
                <input
                  type="text"
                  value={selectedAlloc.employee_name}
                  disabled
                  className="input input-sm input-bordered rounded-lg w-full text-xs font-bold opacity-60 bg-base-200"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Select New Custodian *</label>
                <select
                  value={transferEmployeeId}
                  onChange={(e) => setTransferEmployeeId(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold"
                  required
                >
                  {mockEmployees.filter(e => e.id !== selectedAlloc.employee_id).map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Transfer Notes / Reason *</label>
                <textarea
                  placeholder="e.g. Employee shift to HR department"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-16"
                  required
                ></textarea>
              </div>

              <div className="modal-action gap-2 mt-6">
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-sm btn-primary text-white font-semibold shadow-md shadow-primary/20 px-5 normal-case text-xs"
                >
                  {isProcessing ? 'Transferring...' : 'Reassign Custodian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Return Dialog */}
      {isReturnModalOpen && selectedAlloc && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 max-w-sm">
            <h3 className="font-bold text-sm text-base-content mb-4">Process Asset Check-in</h3>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="text-xs space-y-1.5 bg-base-200/50 p-3 rounded-xl border border-base-300/30 mb-2">
                <div className="flex justify-between">
                  <span className="text-base-content/50">Asset:</span>
                  <span className="font-semibold">{selectedAlloc.asset_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Employee:</span>
                  <span className="font-semibold">{selectedAlloc.employee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Custody Duration:</span>
                  <span className="font-semibold text-primary">{calculateDuration(selectedAlloc.allocated_date)} Days</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Return Condition *</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="select select-sm select-bordered w-full text-xs font-semibold"
                  required
                >
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                  <option value="DAMAGED">DAMAGED</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-base-content/60">Check-in Notes</label>
                <textarea
                  placeholder="Notes on return condition or physical checks"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="textarea textarea-sm textarea-bordered w-full text-xs h-16"
                ></textarea>
              </div>

              <div className="modal-action gap-2 mt-6">
                <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn btn-sm btn-ghost normal-case text-xs">Cancel</button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-sm btn-success text-white font-semibold shadow-md shadow-success/20 px-5 normal-case text-xs"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Slide-out Allocation Details Drawer */}
      {isDrawerOpen && selectedAlloc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-base-100 h-full shadow-2xl p-6 overflow-y-auto animate-slide-left flex flex-col justify-between border-l border-base-300">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-base-300 mb-6">
                <h3 className="font-bold text-sm text-base-content">Allocation Profile</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6 text-xs">
                {/* Asset */}
                <div className="p-3.5 bg-base-200/50 rounded-xl border border-base-300/30">
                  <span className="text-[10px] font-bold text-base-content/40 uppercase block">Asset Profile</span>
                  <h4 className="font-bold text-sm text-base-content/85 mt-1">{selectedAlloc.asset_name}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-medium text-base-content/65">
                    <div>Tag: <span className="font-mono font-bold text-primary">{selectedAlloc.asset_tag}</span></div>
                    <div>Serial: <span>{selectedAlloc.serial_number}</span></div>
                    <div>Category: <span>{selectedAlloc.category_name || 'Unassigned'}</span></div>
                  </div>
                </div>

                {/* Custodian */}
                <div className="space-y-3 pl-1">
                  <div className="flex gap-3">
                    <User size={15} className="text-primary mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Custodian Employee</span>
                      <span className="font-bold text-base-content/80">{selectedAlloc.employee_name}</span>
                      <span className="text-[10px] text-base-content/40 block mt-0.5">{selectedAlloc.employee_email}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar size={15} className="text-secondary mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Duration & Dates</span>
                      <div className="mt-1 space-y-1">
                        <div>Allocated: <span className="font-semibold text-base-content/75">{formatDate(selectedAlloc.allocated_date)}</span></div>
                        <div>Expected Return: <span className="font-semibold text-base-content/75">{formatDate(selectedAlloc.expected_return_date)}</span></div>
                        {selectedAlloc.actual_return_date && (
                          <div>Returned On: <span className="font-semibold text-success">{formatDate(selectedAlloc.actual_return_date)}</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FileText size={15} className="text-neutral-content/70 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Condition Profiles</span>
                      <div className="mt-1 space-y-1 font-medium text-base-content/75">
                        <div>Condition Handout: <span>{selectedAlloc.condition_before}</span></div>
                        <div>Condition Check-in: <span>{selectedAlloc.condition_after || '—'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedAlloc.notes && (
                  <div className="p-3 bg-base-200/40 rounded-xl border border-base-300/30">
                    <span className="text-[10px] font-bold text-base-content/40 uppercase block mb-1">Administrative Notes</span>
                    <p className="text-[11px] leading-relaxed text-base-content/65">{selectedAlloc.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="btn btn-outline btn-sm w-full rounded-xl normal-case font-bold text-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AllocationsPage;
