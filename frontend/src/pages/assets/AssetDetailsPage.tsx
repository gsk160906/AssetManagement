import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Key, Undo2, ArrowLeftRight, Wrench, CalendarDays, UserCheck, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { getAssetById, returnAsset } from '../../services/assetService';
import StatusBadge from '../../components/assets/StatusBadge';
import WarrantyBadge from '../../components/assets/WarrantyBadge';
import QRCodeCard from '../../components/assets/QRCodeCard';
import TimelineView from '../../components/assets/TimelineView';
import UploadDocuments from '../../components/assets/UploadDocuments';
import AllocationModal from '../../components/assets/AllocationModal';
import TransferModal from '../../components/assets/TransferModal';
import MaintenanceModal from '../../components/assets/MaintenanceModal';

export const AssetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'timeline' | 'docs'>('info');

  // Modals state
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);

  const fetchAsset = async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      const res = await getAssetById(id);
      if (res.success) {
        setAsset(res.data);
      } else {
        toast.error('Asset not found');
        navigate('/assets');
      }
    } catch (err: any) {
      toast.error('Failed to load asset details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAsset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReturnAsset = async () => {
    if (!id || !asset) return;
    if (!window.confirm(`Are you sure you want to return ${asset.name} back to inventory?`)) return;
    
    try {
      const res = await returnAsset(id, {
        condition_after: asset.condition,
        notes: 'Handed back by user'
      });
      if (res.success) {
        toast.success('Asset returned successfully!');
        fetchAsset();
      }
    } catch (err: any) {
      toast.error('Failed to return asset');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (!asset) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/assets" className="btn btn-ghost btn-xs btn-circle text-base-content/60">
          <ArrowLeft size={16} />
        </Link>
        <PageHeader
          title={asset.name}
          subtitle={`Tag: ${asset.assetTag} | Serial: ${asset.serialNumber}`}
          breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Assets', path: '/assets' }, { label: 'Details' }]}
          action={
            <button
              onClick={fetchAsset}
              disabled={isRefreshing}
              className="btn btn-outline btn-sm btn-square border-base-300 hover:bg-base-200"
              title="Refresh Asset Details"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-base-300/40 pb-4 mb-4 gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={asset.status} />
                <WarrantyBadge expiryDate={asset.warrantyExpiryDate} />
              </div>

              <div className="flex items-center gap-2">
                {asset.status === 'AVAILABLE' ? (
                  <button
                    onClick={() => setIsAllocModalOpen(true)}
                    className="btn btn-primary btn-xs text-white font-semibold flex items-center gap-1 normal-case px-3 rounded-lg"
                  >
                    <Key size={12} />
                    Check-out Asset
                  </button>
                ) : asset.status === 'ALLOCATED' ? (
                  <button
                    onClick={handleReturnAsset}
                    className="btn btn-success btn-xs text-white font-semibold flex items-center gap-1 normal-case px-3 rounded-lg"
                  >
                    <Undo2 size={12} />
                    Check-in (Return)
                  </button>
                ) : null}

                <button
                  onClick={() => setIsTransModalOpen(true)}
                  className="btn btn-outline btn-xs font-semibold flex items-center gap-1 normal-case px-3 rounded-lg"
                >
                  <ArrowLeftRight size={12} />
                  Request Transfer
                </button>

                <button
                  onClick={() => setIsMaintModalOpen(true)}
                  className="btn btn-warning btn-xs text-warning-content font-semibold flex items-center gap-1 normal-case px-3 rounded-lg"
                >
                  <Wrench size={12} />
                  File Repair
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Manufacturer</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.manufacturer}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Model</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.model}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Category</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.categoryName || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Acquisition date</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{formatDate(asset.acquisitionDate)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Purchase cost</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{formatCurrency(asset.acquisitionCost)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Condition</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.condition}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Department</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.departmentName || 'No Department'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Room / Location</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.currentLocation || 'Not Assigned'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-base-content/40 uppercase block">Shared Scheduler</span>
                <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.isSharedBookable ? 'Shared/Bookable' : 'Individual'}</span>
              </div>
            </div>
          </Card>

          <div className="tabs tabs-bordered">
            <button onClick={() => setActiveTab('info')} className={`tab font-bold text-xs ${activeTab === 'info' ? 'tab-active' : ''}`}>Depreciation & Financials</button>
            <button onClick={() => setActiveTab('docs')} className={`tab font-bold text-xs ${activeTab === 'docs' ? 'tab-active' : ''}`}>Attachments</button>
            <button onClick={() => setActiveTab('timeline')} className={`tab font-bold text-xs ${activeTab === 'timeline' ? 'tab-active' : ''}`}>Asset Timeline</button>
          </div>

          {activeTab === 'info' && (
            <Card>
              <h3 className="text-sm font-bold text-base-content/85 mb-4 flex items-center gap-1.5">
                <Calculator size={15} className="text-primary" />
                Asset Depreciation Tracker
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div className="p-4 bg-base-200/50 rounded-xl space-y-2 border border-base-300/30">
                  <h4 className="font-bold text-xs text-primary uppercase">Straight-Line Method</h4>
                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-base-content/50">Asset Age:</span>
                      <span className="font-semibold">{asset.depreciation.ageMonths} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/50">Useful Life:</span>
                      <span className="font-semibold">{asset.depreciation.straightLine.usefulLifeMonths} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/50">Depreciation %:</span>
                      <span className="font-semibold text-warning">{asset.depreciation.straightLine.percent}%</span>
                    </div>
                    <div className="flex justify-between border-t border-base-300 pt-1.5 font-bold">
                      <span>Book Value:</span>
                      <span className="text-success">{formatCurrency(asset.depreciation.straightLine.bookValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-base-200/50 rounded-xl space-y-2 border border-base-300/30">
                  <h4 className="font-bold text-xs text-secondary uppercase">Declining Balance Method</h4>
                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <span className="text-base-content/50">Annual Rate:</span>
                      <span className="font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/50">Asset Age:</span>
                      <span className="font-semibold">{asset.depreciation.ageYears} Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/50">Depreciation %:</span>
                      <span className="font-semibold text-warning">{asset.depreciation.decliningBalance.percent}%</span>
                    </div>
                    <div className="flex justify-between border-t border-base-300 pt-1.5 font-bold">
                      <span>Book Value:</span>
                      <span className="text-success">{formatCurrency(asset.depreciation.decliningBalance.bookValue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'docs' && (
            <UploadDocuments assetId={asset.id} />
          )}

          {activeTab === 'timeline' && (
            <TimelineView assetId={asset.id} />
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <QRCodeCard assetId={asset.id} assetTag={asset.assetTag} />
          
          <Card title="Ownership Context">
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <UserCheck size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-base-content/40 uppercase block">Created By</span>
                  <span className="font-semibold text-base-content/85 block">{asset.createdByName || 'System'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-base-content/40 uppercase block">Registered On</span>
                  <span className="font-semibold text-base-content/85 block">{formatDate(asset.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AllocationModal
        assetId={asset.id}
        assetTag={asset.assetTag}
        isOpen={isAllocModalOpen}
        onClose={() => setIsAllocModalOpen(false)}
        onSuccess={fetchAsset}
      />

      <TransferModal
        assetId={asset.id}
        assetTag={asset.assetTag}
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        onSuccess={fetchAsset}
      />

      <MaintenanceModal
        assetId={asset.id}
        assetTag={asset.assetTag}
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        onSuccess={fetchAsset}
      />
    </div>
  );
};
export default AssetDetailsPage;
