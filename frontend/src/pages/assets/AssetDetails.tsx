import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Key, Undo2, ArrowLeftRight, Wrench, CalendarDays, UserCheck, QrCode, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { returnAsset } from '../../services/assetService';
import useAsset from '../../hooks/useAsset';
import StatusBadge from '../../components/assets/StatusBadge';
import WarrantyBadge from '../../components/assets/WarrantyBadge';
import TimelineView from '../../components/assets/TimelineView';
import UploadDocuments from '../../components/assets/UploadDocuments';
import AllocationModal from '../../components/assets/AllocationModal';
import TransferModal from '../../components/assets/TransferModal';
import MaintenanceModal from '../../components/assets/MaintenanceModal';

export const AssetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { asset, isLoading, error, refetch } = useAsset(id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'timeline'>('info');

  const displayQRCode = asset
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/assets/${asset.id}`)}`
    : null;

  const handleDownloadQR = async () => {
    if (!asset || !displayQRCode) return;
    try {
      const res = await fetch(displayQRCode);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Asset-QR-${asset.assetTag}.png`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('QR Code downloaded');
    } catch (e) {
      window.open(displayQRCode, '_blank');
    }
  };

  // Modals state
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Asset details refreshed');
  };

  const handleReturnAsset = async () => {
    if (!id || !asset) return;
    if (!window.confirm(`Are you sure you want to return ${asset.name} back to inventory?`)) return;
    
    try {
      const res = await returnAsset(id, {
        condition_after: asset.condition,
        notes: 'Returned by custodian via details portal'
      });
      if (res.success) {
        toast.success('Asset returned successfully!');
        refetch();
      }
    } catch (err: any) {
      toast.error('Failed to return asset');
    }
  };

  const handlePrintQR = () => {
    if (!displayQRCode || !asset) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>Print QR Label - ${asset.assetTag}</title></head>
          <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; margin:0;">
            <img src="${displayQRCode}" style="width:240px; height:240px; border:1px solid #ddd; padding:8px; border-radius:12px;"/>
            <h2 style="margin-top:16px; margin-bottom:4px; font-size: 18px; color: #222;">${asset.name}</h2>
            <p style="margin:2px 0; font-family:monospace; font-weight:bold; font-size: 12px; color:#555;">TAG: ${asset.assetTag}</p>
            <p style="margin:2px 0; font-family:monospace; font-size: 11px; color:#888;">S/N: ${asset.serialNumber}</p>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 bg-base-300 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-48 bg-base-300 rounded-2xl"></div>
            <div className="h-64 bg-base-300 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-base-300 rounded-2xl"></div>
            <div className="h-48 bg-base-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="text-error font-bold text-lg">{error === 'Asset Not Found' ? 'Asset Not Found' : 'Unable to load asset.'}</div>
        <p className="text-xs text-base-content/60 max-w-sm">The requested resource could not be loaded. Please check the ID or network connection.</p>
        <div className="flex gap-2">
          <Link to="/assets" className="btn btn-sm btn-ghost text-xs">← Back to Assets</Link>
          <button onClick={refetch} className="btn btn-sm btn-primary text-white font-semibold text-xs">Try Again</button>
        </div>
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
    <div className="space-y-6 animate-fade-in p-6">
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
              onClick={handleRefresh}
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
        {/* Left Side: General Profile Card & Action Tabs */}
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
                    Check-out
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
            <button onClick={() => setActiveTab('info')} className={`tab font-bold text-xs ${activeTab === 'info' ? 'tab-active' : ''}`}>Depreciation & Allocation</button>
            <button onClick={() => setActiveTab('docs')} className={`tab font-bold text-xs ${activeTab === 'docs' ? 'tab-active' : ''}`}>Attachments</button>
            <button onClick={() => setActiveTab('timeline')} className={`tab font-bold text-xs ${activeTab === 'timeline' ? 'tab-active' : ''}`}>Asset Timeline</button>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Allocation Information */}
              <Card title="Current Allocation Info">
                {asset.status === 'ALLOCATED' ? (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Allocated Employee</span>
                      <span className="font-semibold text-base-content/85 mt-0.5 block">Sarah Jenkins (IT)</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Department</span>
                      <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.departmentName || 'IT Support'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Allocation Date</span>
                      <span className="font-semibold text-base-content/85 mt-0.5 block">{formatDate(asset.acquisitionDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-base-content/40 uppercase block">Expected Return Date</span>
                      <span className="font-semibold text-base-content/85 mt-0.5 block">{asset.warrantyExpiryDate ? formatDate(asset.warrantyExpiryDate) : 'Not Specified'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-success font-bold text-xs">
                    Currently Available
                  </div>
                )}
              </Card>

              {/* Depreciation info */}
              <Card title="Asset Financial Depreciation">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-base-200/50 rounded-xl space-y-2 border border-base-300/30 text-xs">
                    <h4 className="font-bold text-primary uppercase">Straight-Line Method</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-base-content/50">Age (Months):</span>
                        <span className="font-semibold">{asset.depreciation.ageMonths}</span>
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

                  <div className="p-4 bg-base-200/50 rounded-xl space-y-2 border border-base-300/30 text-xs">
                    <h4 className="font-bold text-secondary uppercase">Declining Balance Method</h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span className="text-base-content/50">Annual Rate:</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/50">Age (Years):</span>
                        <span className="font-semibold">{asset.depreciation.ageYears}</span>
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
            </div>
          )}

          {activeTab === 'docs' && (
            <UploadDocuments assetId={asset.id} />
          )}

          {activeTab === 'timeline' && (
            <TimelineView assetId={asset.id} />
          )}
        </div>

        {/* Right Side: QR code & side info panels */}
        <div className="lg:col-span-1 space-y-6">
          {/* QR Code Section */}
          <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col items-center text-center justify-between min-h-[260px]">
            <div className="w-full pb-2 border-b border-base-300/30 flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                <QrCode size={14} className="text-primary" />
                Asset QR Code
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {displayQRCode ? (
                <img src={displayQRCode} alt={`QR Label ${asset.assetTag}`} className="w-32 h-32 border border-base-300/30 rounded-xl p-1 bg-white" />
              ) : (
                <div className="loading loading-spinner text-primary"></div>
              )}
            </div>

            {displayQRCode && (
              <div className="grid grid-cols-2 gap-2 w-full mt-3">
                <button
                  onClick={handleDownloadQR}
                  className="btn btn-primary btn-xs rounded-lg flex items-center justify-center gap-1 text-white font-semibold normal-case"
                >
                  <Download size={12} />
                  Download QR
                </button>
                <button
                  onClick={handlePrintQR}
                  className="btn btn-outline btn-xs rounded-lg flex items-center justify-center gap-1 font-semibold normal-case"
                >
                  <Printer size={12} />
                  Print QR
                </button>
              </div>
            )}
          </div>
          
          <Card title="Ownership Context">
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <UserCheck size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-base-content/40 uppercase block">Created By</span>
                  <span className="font-semibold text-base-content/85 block">{asset.createdByName || 'System Administrator'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-base-content/40 uppercase block">Created Date</span>
                  <span className="font-semibold text-base-content/85 block">{formatDate(asset.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral/10 text-neutral-content rounded-xl">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-base-content/40 uppercase block">Last Updated</span>
                  <span className="font-semibold text-base-content/85 block">{formatDate(asset.updatedAt)}</span>
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
        onSuccess={refetch}
      />

      <TransferModal
        assetId={asset.id}
        assetTag={asset.assetTag}
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        onSuccess={refetch}
      />

      <MaintenanceModal
        assetId={asset.id}
        assetTag={asset.assetTag}
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};
export default AssetDetails;
