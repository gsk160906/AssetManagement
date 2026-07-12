import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, Download, RefreshCw, CalendarDays, Star, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBookingReport } from '../../services/reportService';
import { ReportExportModal } from './ReportExportModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

export const BookingReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBookingReport();
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

  const topBookedName = data?.top_resources?.[0]?.name || '—';
  const barColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Resource Booking Report"
        subtitle="Monitor shared conference rooms, vehicles, device reservations, and peak utilization trends."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports', path: '/reports' }, { label: 'Bookings' }]}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total Reservations" value={data.total_bookings} color="bg-primary/10 text-primary" icon={<CalendarDays size={16} />} />
          <StatCard label="Most Booked Resource" value={topBookedName} color="bg-success/10 text-success" icon={<Star size={16} />} />
          <StatCard label="Reserved Capacity" value={`${data.data?.length || 0} slots`} color="bg-info/10 text-info" icon={<Users size={16} />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center pb-3 border-b border-base-300/30 mb-2">
              <span className="text-[10px] font-bold text-base-content/40 uppercase">{data?.data?.length || 0} reservation logs</span>
              <button onClick={loadReport} className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case"><RefreshCw size={12} /> Refresh</button>
            </div>

            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-8 w-full rounded-xl opacity-50" />
                  ))}
                </div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="text-center py-12 text-xs text-base-content/30 italic">No bookings records found.</div>
              ) : (
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                      <th>Resource</th>
                      <th>Reserved By</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((item: any) => (
                      <tr key={item.id} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                        <td>
                          <span className="font-bold text-base-content/85">{item.asset_name}</span>
                          <div className="font-mono text-[9px] text-primary">{item.asset_tag}</div>
                        </td>
                        <td className="text-base-content/70 font-semibold">{item.employee_name}</td>
                        <td>{new Date(item.start_time).toLocaleString()}</td>
                        <td>{new Date(item.end_time).toLocaleString()}</td>
                        <td className="max-w-[120px] truncate text-base-content/60">{item.purpose}</td>
                        <td>
                          <span className={`badge badge-sm font-bold uppercase ${
                            item.status === 'COMPLETED' ? 'badge-success text-success-content' :
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
        </div>

        {/* Right Side Bar Chart */}
        <div className="space-y-6">
          <Card title="Resource Utilization Top Chart">
            {!data?.top_resources || data.top_resources.length === 0 ? (
              <div className="text-center py-16 text-xs text-base-content/30 italic">No usage records to display chart.</div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_resources} margin={{ left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="usage" radius={[4, 4, 0, 0]}>
                      {data.top_resources.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType="BOOKING_REPORT"
        reportName="Resource Booking Report"
      />
    </div>
  );
};

export default BookingReport;
