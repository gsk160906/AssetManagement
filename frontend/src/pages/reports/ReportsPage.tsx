import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import {
  FileText, Package, Wrench, ClipboardCheck, CalendarDays, DollarSign,
  Download, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';

const ReportCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}> = ({ title, description, icon, color, path }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(path)}
      className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className={`p-2.5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
        <h4 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-xs text-base-content/50 leading-relaxed mt-1">{description}</p>
      </div>
      <div className="flex justify-end mt-4">
        <span className="text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1 uppercase">
          Open Report <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const { reports, history, isLoading, error, refetch } = useReports();

  const reportPaths: Record<string, string> = {
    ASSET_REPORT: '/reports/assets',
    MAINTENANCE_REPORT: '/reports/maintenance',
    AUDIT_REPORT: '/reports/audits',
    BOOKING_REPORT: '/reports/bookings',
    EXPENSE_REPORT: '/reports/expenses'
  };

  const reportIcons: Record<string, React.ReactNode> = {
    ASSET_REPORT: <Package size={18} />,
    MAINTENANCE_REPORT: <Wrench size={18} />,
    AUDIT_REPORT: <ClipboardCheck size={18} />,
    BOOKING_REPORT: <CalendarDays size={18} />,
    EXPENSE_REPORT: <DollarSign size={18} />
  };

  const reportColors: Record<string, string> = {
    ASSET_REPORT: 'bg-primary/10 text-primary',
    MAINTENANCE_REPORT: 'bg-warning/10 text-warning',
    AUDIT_REPORT: 'bg-success/10 text-success',
    BOOKING_REPORT: 'bg-info/10 text-info',
    EXPENSE_REPORT: 'bg-secondary/10 text-secondary'
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Analyze asset logs, audit checklists, booking frequencies, and operational expenses."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports' }]}
      />

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="p-4 bg-error/10 text-error rounded-2xl"><AlertCircle size={32} /></div>
          <h2 className="text-sm font-bold text-base-content">{error}</h2>
          <button onClick={refetch} className="btn btn-outline btn-xs">Retry</button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map(r => (
              <ReportCard
                key={r.type}
                title={r.name}
                description={r.description || 'View analytical summaries'}
                icon={reportIcons[r.type] || <FileText size={18} />}
                color={reportColors[r.type] || 'bg-base-200 text-base-content'}
                path={reportPaths[r.type] || '/reports'}
              />
            ))}
          </div>

          {/* Export History Logs */}
          <Card title="Recent Report Generation History">
            <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
              <span className="text-[10px] font-bold text-base-content/40 uppercase">{history.length} report logs stored</span>
              <button onClick={refetch} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              {history.length === 0 ? (
                <div className="text-center py-12 text-xs text-base-content/30 italic">No report download history found.</div>
              ) : (
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                      <th>Report Type</th>
                      <th>Format</th>
                      <th>Filters Used</th>
                      <th>Generated By</th>
                      <th>Generated At</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(item => {
                      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
                      const absoluteUrl = apiBase.replace('/api/v1', '') + '/exports/' + item.file_name;

                      return (
                        <tr key={item.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                          <td className="font-bold text-base-content/85">{item.report_type.replace('_', ' ')}</td>
                          <td>
                            <span className={`badge badge-sm font-bold ${item.file_format === 'PDF' ? 'badge-error text-error-content' : 'badge-success text-success-content'}`}>
                              {item.file_format}
                            </span>
                          </td>
                          <td className="font-mono text-[9px] text-base-content/50 max-w-[150px] truncate">
                            {JSON.stringify(item.filters)}
                          </td>
                          <td className="font-semibold text-base-content/75">{item.user_name}</td>
                          <td>{formatDate(item.generated_at)}</td>
                          <td className="text-right">
                            <a
                              href={absoluteUrl}
                              download={item.file_name}
                              className="btn btn-ghost btn-xs btn-circle text-primary"
                              title="Download Report File"
                            >
                              <Download size={13} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
