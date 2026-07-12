import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, Download, RefreshCw, Search, X, Package, CheckCircle2,
  AlertTriangle, Wrench, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAssetReport } from '../../services/reportService';
import { ReportExportModal } from './ReportExportModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatCard: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({
  label, value, color, icon
}) => (
  <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-base-content/40 uppercase">{label}</p>
      <p className="text-xl font-extrabold text-base-content">{value}</p>
    </div>
  </div>
);

export const AssetReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filters State
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAssetReport({
        status: status || undefined,
        location: location || undefined
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setIsLoading(false);
    }
  }, [status, location]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const filteredAssets = data?.data?.filter((a: any) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.asset_tag.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  // Chart data
  const pieData = data?.summary ? [
    { name: 'Available', value: parseInt(data.summary.available, 10), color: '#10B981' },
    { name: 'Allocated', value: parseInt(data.summary.allocated, 10), color: '#3B82F6' },
    { name: 'Under Maintenance', value: parseInt(data.summary.under_maintenance, 10), color: '#F59E0B' },
    { name: 'Retired', value: parseInt(data.summary.retired, 10), color: '#EF4444' },
    { name: 'Disposed', value: parseInt(data.summary.disposed, 10), color: '#6B7280' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Asset Inventory Report"
        subtitle="Extract detailed inventories, allocations percentages, and status valuations."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports', path: '/reports' }, { label: 'Assets' }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              <ArrowLeft size={13} className="mr-1" /> Back
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsExportOpen(true)}>
              <Download size={13} className="mr-1" /> Export Report
            </Button>
          </div>
        }
      />

      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total Inventory" value={data.summary.total_assets} color="bg-primary/10 text-primary" icon={<Package size={16} />} />
          <StatCard label="Available" value={data.summary.available} color="bg-success/10 text-success" icon={<CheckCircle2 size={16} />} />
          <StatCard label="Allocated" value={data.summary.allocated} color="bg-info/10 text-info" icon={<Wrench size={16} />} />
          <StatCard label="In Repair" value={data.summary.under_maintenance} color="bg-warning/10 text-warning" icon={<AlertTriangle size={16} />} />
          <StatCard label="Disposed / Retired" value={parseInt(data.summary.disposed, 10) + parseInt(data.summary.retired, 10)} color="bg-neutral/10 text-base-content/60" icon={<ShieldAlert size={16} />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters & Search */}
          <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <select value={status} onChange={e => setStatus(e.target.value)} className="select select-xs select-bordered text-xs rounded-xl font-medium">
                <option value="">All Statuses</option>
                {['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED', 'DISPOSED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                placeholder="Filter location..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="input input-xs input-bordered text-xs rounded-xl max-w-[120px]"
              />
              {(status || location) && (
                <button onClick={() => { setStatus(''); setLocation(''); }} className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"><X size={12} /></button>
              )}
            </div>
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search name, code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input input-xs input-bordered text-xs rounded-xl w-full pl-8"
              />
              <Search size={12} className="absolute left-2.5 top-2.5 text-base-content/40" />
            </div>
          </div>

          <Card>
            <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
              <span className="text-[10px] font-bold text-base-content/40 uppercase">{filteredAssets.length} items found</span>
              <button onClick={loadReport} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-8 w-full rounded-xl opacity-50" />
                  ))}
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12 text-xs text-base-content/30 italic">No assets match filter query.</div>
              ) : (
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                      <th>Asset</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Purchase cost</th>
                      <th>Purchase Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((a: any) => (
                      <tr key={a.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                        <td>
                          <span className="font-bold text-base-content/85">{a.name}</span>
                          <div className="font-mono text-[9px] text-primary">{a.asset_tag}</div>
                        </td>
                        <td className="text-base-content/60 font-semibold">{a.category_name ?? '—'}</td>
                        <td className="text-base-content/60">{a.current_location || '—'}</td>
                        <td className="font-semibold text-base-content/75">${a.purchase_cost}</td>
                        <td>{a.purchase_date ? new Date(a.purchase_date).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`badge badge-sm font-bold uppercase ${
                            a.status === 'AVAILABLE' ? 'badge-success text-success-content' :
                            a.status === 'ALLOCATED' ? 'badge-info text-info-content' : 'badge-warning text-warning-content'
                          }`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side - Pie Chart */}
        <div className="space-y-6">
          <Card title="Status Distribution">
            {pieData.length === 0 ? (
              <div className="text-center py-16 text-xs text-base-content/30 italic">No data to display chart.</div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2}>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} Assets`]} />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType="ASSET_REPORT"
        reportName="Asset Inventory Report"
      />
    </div>
  );
};

export default AssetReport;
