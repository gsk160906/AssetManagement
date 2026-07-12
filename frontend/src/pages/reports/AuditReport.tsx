import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, Download, RefreshCw, ClipboardCheck, CheckCircle2,
  AlertTriangle, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuditReport } from '../../services/reportService';
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

export const AuditReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAuditReport();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Audit Compliance Report"
        subtitle="Review audit completion frequencies, accuracy percentages, and missing physical assets."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports', path: '/reports' }, { label: 'Audits' }]}
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

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Audits" value={data.total_audits} color="bg-primary/10 text-primary" icon={<ClipboardCheck size={16} />} />
          <StatCard label="Completed" value={data.completed} color="bg-success/10 text-success" icon={<CheckCircle2 size={16} />} />
          <StatCard label="Accuracy Average" value={data.accuracy_average} color="bg-info/10 text-info" icon={<AlertTriangle size={16} />} />
          <StatCard label="Missing Assets" value={data.missing_assets} color="bg-error/10 text-error" icon={<ShieldAlert size={16} />} />
        </div>
      )}

      <Card>
        <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
          <span className="text-[10px] font-bold text-base-content/40 uppercase">{data?.data?.length || 0} session records</span>
          <button onClick={loadReport} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case"><RefreshCw size={12} /> Refresh</button>
        </div>

        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-8 w-full rounded-xl opacity-50" />
              ))}
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-12 text-xs text-base-content/30 italic">No audit records found.</div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                  <th>Audit Session</th>
                  <th>Type</th>
                  <th>Schedule Date</th>
                  <th>Total Assets</th>
                  <th>Verified</th>
                  <th>Missing</th>
                  <th>Damaged</th>
                  <th>Accuracy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item: any) => {
                  const tot = parseInt(item.total_assets, 10) || 0;
                  const ver = parseInt(item.verified, 10) || 0;
                  const acc = tot > 0 ? `${Math.round((ver / tot) * 100)}%` : '100%';

                  return (
                    <tr key={item.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                      <td>
                        <span className="font-bold text-base-content/85">{item.audit_name}</span>
                        <div className="font-mono text-[9px] text-primary">{item.audit_code}</div>
                      </td>
                      <td className="text-base-content/60 font-semibold uppercase">{item.audit_type}</td>
                      <td>
                        <div>Start: {formatDate(item.start_date)}</div>
                        {item.end_date && <div className="text-[10px] text-base-content/40">End: {formatDate(item.end_date)}</div>}
                      </td>
                      <td className="font-semibold">{tot}</td>
                      <td className="text-success font-semibold">{item.verified}</td>
                      <td className="text-error font-semibold">{item.missing}</td>
                      <td className="text-warning font-semibold">{item.damaged}</td>
                      <td className="font-bold text-primary">{acc}</td>
                      <td>
                        <span className={`badge badge-sm font-bold uppercase ${
                          item.status === 'completed' ? 'badge-success text-success-content' :
                          item.status === 'cancelled' ? 'badge-error text-error-content' : 'badge-info text-info-content'
                        }`}>{item.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType="AUDIT_REPORT"
        reportName="Audit Compliance Report"
      />
    </div>
  );
};

export default AuditReport;
