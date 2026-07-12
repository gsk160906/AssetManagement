import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, Download, RefreshCw, X, Search, Wrench, CheckCircle2,
  AlertTriangle, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMaintenanceReport } from '../../services/reportService';
import { ReportExportModal } from './ReportExportModal';

const StatCard: React.FC<{ label: string; value: number | string; color: string; icon: React.ReactNode }> = ({
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

export const MaintenanceReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filters State
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMaintenanceReport({
        status: status || undefined,
        priority: priority || undefined
      });
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setIsLoading(false);
    }
  }, [status, priority]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const filteredItems = data?.data?.filter((item: any) =>
    item.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Maintenance Cost Report"
        subtitle="Analyze technician service workloads, priority distributions, and cost breakdowns."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports', path: '/reports' }, { label: 'Maintenance' }]}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Tickets" value={data.summary.total_services} color="bg-primary/10 text-primary" icon={<Wrench size={16} />} />
          <StatCard label="Completed" value={data.summary.completed} color="bg-success/10 text-success" icon={<CheckCircle2 size={16} />} />
          <StatCard label="Pending" value={data.summary.pending} color="bg-warning/10 text-warning" icon={<AlertTriangle size={16} />} />
          <StatCard label="Total Costs" value={`$${data.cost_summary.total_cost}`} color="bg-secondary/10 text-secondary" icon={<DollarSign size={16} />} />
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)} className="select select-xs select-bordered text-xs rounded-xl font-medium">
            <option value="">All Statuses</option>
            {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="select select-xs select-bordered text-xs rounded-xl font-medium">
            <option value="">All Priorities</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(status || priority) && (
            <button onClick={() => { setStatus(''); setPriority(''); }} className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"><X size={12} /></button>
          )}
        </div>
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search asset, ticket desc..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input input-xs input-bordered text-xs rounded-xl w-full pl-8"
          />
          <Search size={12} className="absolute left-2.5 top-2.5 text-base-content/40" />
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
          <span className="text-[10px] font-bold text-base-content/40 uppercase">{filteredItems.length} records found</span>
          <button onClick={loadReport} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case"><RefreshCw size={12} /> Refresh</button>
        </div>

        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-8 w-full rounded-xl opacity-50" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-base-content/30 italic">No maintenance tickets match filter criteria.</div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  <th>Asset</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Est. Cost</th>
                  <th>Actual Cost</th>
                  <th>Completed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                    <td>
                      <span className="font-bold text-base-content/85">{item.asset_name}</span>
                      <div className="font-mono text-[9px] text-primary">{item.asset_tag}</div>
                    </td>
                    <td className="max-w-xs truncate text-base-content/60 font-semibold">{item.description}</td>
                    <td>
                      <span className={`badge badge-sm font-bold uppercase ${
                        item.priority === 'CRITICAL' ? 'badge-error text-error-content' :
                        item.priority === 'HIGH' ? 'badge-warning text-warning-content' : 'badge-ghost text-base-content/50'
                      }`}>{item.priority}</span>
                    </td>
                    <td className="font-semibold text-base-content/75">${item.estimated_cost}</td>
                    <td className="font-bold text-primary">${item.actual_cost}</td>
                    <td>{item.completed_date ? new Date(item.completed_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-sm font-bold uppercase ${
                        item.status === 'RESOLVED' ? 'badge-success text-success-content' :
                        item.status === 'CANCELLED' ? 'badge-error text-error-content' : 'badge-info text-info-content'
                      }`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType="MAINTENANCE_REPORT"
        reportName="Maintenance History Report"
      />
    </div>
  );
};

export default MaintenanceReport;
