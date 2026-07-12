import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { getAssets, bulkDelete, bulkUpdateStatus, deleteAsset } from '../../services/assetService';
import StatusBadge from '../../components/assets/StatusBadge';
import WarrantyBadge from '../../components/assets/WarrantyBadge';
import AssetFilters from '../../components/assets/AssetFilters';
import BulkActionToolbar from '../../components/assets/BulkActionToolbar';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    department_id: '',
    category_id: '',
    condition: '',
    minCost: '',
    maxCost: ''
  });

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await getAssets({
        ...filters,
        page,
        limit
      });
      if (res.success) {
        setAssets(res.data.assets);
        setTotal(res.data.total);
      }
    } catch (err: any) {
      toast.error('Failed to load assets inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
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
      department_id: '',
      category_id: '',
      condition: '',
      minCost: '',
      maxCost: ''
    });
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(assets.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      const res = await deleteAsset(id);
      if (res.success) {
        toast.success('Asset deleted');
        fetchAssets();
      }
    } catch (err: any) {
      toast.error('Failed to delete asset');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} assets?`)) return;
    setIsProcessing(true);
    try {
      const res = await bulkDelete(selectedIds);
      if (res.success) {
        toast.success('Selected assets deleted successfully');
        setSelectedIds([]);
        fetchAssets();
      }
    } catch (err: any) {
      toast.error('Bulk deletion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    setIsProcessing(true);
    try {
      const res = await bulkUpdateStatus(selectedIds, status);
      if (res.success) {
        toast.success('Status updated successfully');
        setSelectedIds([]);
        fetchAssets();
      }
    } catch (err: any) {
      toast.error('Bulk status update failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCSVExport = () => {
    const selectedAssets = assets.filter((a) => selectedIds.includes(a.id));
    const header = 'Asset Tag,Asset Name,Serial Number,Category,Department,Status,Condition,Acquisition Cost\n';
    const rows = selectedAssets.map((a) => 
      `"${a.assetTag}","${a.name}","${a.serialNumber}","${a.categoryName || ''}","${a.departmentName || ''}","${a.status}","${a.condition}",${a.acquisitionCost}`
    ).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AssetFlow-Export-${Date.now()}.csv`;
    link.click();
    toast.success('CSV Export ready for download');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-20 relative">
      <PageHeader
        title="Assets Inventory"
        subtitle="Complete cataloging and tracking of company assets."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Assets' }]}
        action={
          <Link to="/assets/create">
            <Button variant="primary" size="sm" className="shadow-md shadow-primary/15">
              <Plus size={16} className="mr-1" />
              Register Asset
            </Button>
          </Link>
        }
      />

      <AssetFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <Card>
        <div className="overflow-x-auto w-full min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-16 text-base-content/40 text-xs font-semibold">
              No physical assets matching filter criteria found.
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === assets.length && assets.length > 0}
                    />
                  </th>
                  <th>Tag</th>
                  <th>Name</th>
                  <th>Serial</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Cost</th>
                  <th>Warranty</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={selectedIds.includes(asset.id)}
                        onChange={(e) => handleSelectRow(asset.id, e.target.checked)}
                      />
                    </td>
                    <td className="font-mono text-[10px] font-bold text-primary">{asset.assetTag}</td>
                    <td className="font-semibold text-base-content/85 whitespace-nowrap">
                      <Link to={`/assets/${asset.id}`} className="hover:text-primary transition-colors hover:underline">
                        {asset.name}
                      </Link>
                    </td>
                    <td className="text-base-content/60 font-medium whitespace-nowrap">{asset.serialNumber}</td>
                    <td className="text-base-content/60">{asset.categoryName || 'Unassigned'}</td>
                    <td className="text-base-content/60">{asset.departmentName || 'Unassigned'}</td>
                    <td className="font-bold text-base-content/80">{formatCurrency(asset.acquisitionCost)}</td>
                    <td>
                      <WarrantyBadge expiryDate={asset.warrantyExpiryDate} />
                    </td>
                    <td>
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="text-right flex items-center justify-end gap-1.5 h-full py-2">
                      <Link to={`/assets/${asset.id}`} className="btn btn-ghost btn-xs text-primary font-bold normal-case hover:bg-primary/10">
                        👁 View
                      </Link>
                      <Link to={`/assets/edit/${asset.id}`} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-warning" title="Edit">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(asset.id)} className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error" title="Delete">
                        <Trash size={14} />
                      </button>
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

      <BulkActionToolbar
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onCSVExport={handleCSVExport}
        isProcessing={isProcessing}
      />
    </div>
  );
};
export default AssetsPage;
