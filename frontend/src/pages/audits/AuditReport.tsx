import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, ShieldAlert,
  Calendar, User, Building2
} from 'lucide-react';
import { getAuditById, getAuditReport, getAuditLogs } from '../../services/auditService';

export const AuditReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [audit, setAudit] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [auditRes, reportRes, logsRes] = await Promise.all([
        getAuditById(id),
        getAuditReport(id),
        getAuditLogs(id)
      ]);
      if (auditRes.success) setAudit(auditRes.data.audit);
      if (reportRes.success) setReport(reportRes.data);
      if (logsRes.success) setLogs(logsRes.data.logs ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="skeleton h-48 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !audit || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="p-4 bg-error/10 text-error rounded-2xl"><ShieldAlert size={40} /></div>
        <h2 className="text-lg font-bold text-base-content">{error || 'Session report unavailable.'}</h2>
        <Link to={`/audits/${id}`} className="btn btn-primary btn-sm normal-case font-semibold text-xs">
          <ArrowLeft size={14} className="mr-1" /> Back to Session Details
        </Link>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Audit Accuracy Report"
        subtitle={`${audit.audit_name} · ${audit.audit_code}`}
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Audits', path: '/audits' },
          { label: audit.audit_code, path: `/audits/${id}` },
          { label: 'Accuracy Report' }
        ]}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate(`/audits/${id}`)}>
            <ArrowLeft size={13} className="mr-1" /> Back to Details
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accuracy Score Card */}
          <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center text-lg font-extrabold text-primary shrink-0">
                {report.accuracy}
              </div>
              <div>
                <h4 className="text-sm font-bold text-base-content/80">Inventory Accuracy Rating</h4>
                <p className="text-xs text-base-content/50 leading-relaxed mt-0.5">
                  Percentage of verified physical assets found in correct locations against database records.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-base-300/40 pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-bold text-base-content/40 uppercase">Total Items</span>
                <p className="text-xl font-black mt-0.5 text-base-content">{report.total_assets}</p>
              </div>
            </div>
          </div>

          {/* Distribution Bars */}
          <Card title="Verification Status Distribution">
            <div className="space-y-4">
              {/* Verified */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-success flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
                  <span className="text-base-content/70">{report.verified} assets ({Math.round((report.verified / report.total_assets) * 100)}%)</span>
                </div>
                <progress className="progress progress-success w-full h-2" value={report.verified} max={report.total_assets} />
              </div>

              {/* Relocated */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-info flex items-center gap-1"><Building2 size={12} /> Relocated</span>
                  <span className="text-base-content/70">{report.relocated} assets ({Math.round((report.relocated / report.total_assets) * 100)}%)</span>
                </div>
                <progress className="progress progress-info w-full h-2" value={report.relocated} max={report.total_assets} />
              </div>

              {/* Damaged */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-warning flex items-center gap-1"><AlertTriangle size={12} /> Damaged</span>
                  <span className="text-base-content/70">{report.damaged} assets ({Math.round((report.damaged / report.total_assets) * 100)}%)</span>
                </div>
                <progress className="progress progress-warning w-full h-2" value={report.damaged} max={report.total_assets} />
              </div>

              {/* Missing */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-error flex items-center gap-1"><ShieldAlert size={12} /> Missing / Not Found</span>
                  <span className="text-base-content/70">{report.missing + report.not_found} assets ({Math.round(((report.missing + report.not_found) / report.total_assets) * 100)}%)</span>
                </div>
                <progress className="progress progress-error w-full h-2" value={report.missing + report.not_found} max={report.total_assets} />
              </div>
            </div>
          </Card>

          {/* Audit Logs */}
          <Card title="Audit Verification Log History">
            {logs.length === 0 ? (
              <div className="text-center py-6 text-xs text-base-content/30 italic">No activity logs recorded.</div>
            ) : (
              <div className="relative border-l border-base-300/40 ml-2.5 pl-4 space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="text-xs relative">
                    <div className="absolute w-2 h-2 rounded-full bg-primary -left-[21px] top-1.5" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base-content/80 uppercase tracking-wider text-[10px]">{log.action.replace('_', ' ')}</span>
                      <span className="text-[10px] text-base-content/40">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-base-content/60 mt-1">{log.description}</p>
                    {log.user_name && <p className="text-[9px] text-base-content/40 mt-0.5">By: {log.user_name}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side - Metadata */}
        <div className="space-y-6">
          <Card title="Session Summary">
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-base-300/10">
                <span className="text-base-content/50">Reference Code</span>
                <span className="font-mono font-bold text-primary">{audit.audit_code}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-base-300/10">
                <span className="text-base-content/50">Audit Type</span>
                <span className="font-bold uppercase">{audit.audit_type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-base-300/10">
                <span className="text-base-content/50">Auditor</span>
                <span className="font-bold flex items-center gap-1"><User size={12} /> {audit.auditor_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-base-300/10">
                <span className="text-base-content/50">Scheduled Date</span>
                <span className="font-bold flex items-center gap-1"><Calendar size={12} /> {formatDate(audit.start_date)}</span>
              </div>
              {audit.end_date && (
                <div className="flex justify-between py-1.5 border-b border-base-300/10">
                  <span className="text-base-content/50">Completion Date</span>
                  <span className="font-bold flex items-center gap-1 text-success"><CheckCircle2 size={12} /> {formatDate(audit.end_date)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditReport;
