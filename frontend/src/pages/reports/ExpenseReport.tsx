import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft, Download, DollarSign, BarChart3, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getExpenseReport } from '../../services/reportService';
import { ReportExportModal } from './ReportExportModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export const ExpenseReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getExpenseReport();
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

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader
        title="Cost & Expense Report"
        subtitle="Track total physical acquisitions costs, monthly repair expenditures, and asset valuations."
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Reports', path: '/reports' }, { label: 'Expenses' }]}
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
          <StatCard label="Total Cumulative Spend" value={`$${data.total_expense.toLocaleString()}`} color="bg-secondary/10 text-secondary" icon={<DollarSign size={16} />} />
          <StatCard label="Assets Acquisition" value={`$${data.purchase_cost.toLocaleString()}`} color="bg-primary/10 text-primary" icon={<BarChart3 size={16} />} />
          <StatCard label="Maintenance Costs" value={`$${data.maintenance_cost.toLocaleString()}`} color="bg-warning/10 text-warning" icon={<TrendingUp size={16} />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Spend Cost Breakdown">
            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-8 w-full rounded-xl opacity-50" />
                  ))}
                </div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="text-center py-6 text-xs text-base-content/30 italic">No cost entries.</div>
              ) : (
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase font-bold">
                      <th>Expense Category</th>
                      <th className="text-right">Total Expenditures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-base-200/20 border-b border-base-300/20 text-xs">
                        <td className="font-bold text-base-content/85">{item.category}</td>
                        <td className="text-right font-extrabold text-primary">${item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side Line Chart */}
        <div className="space-y-6">
          <Card title="Monthly Maintenance Expenses Trend">
            {!data?.monthly_trend || data.monthly_trend.length === 0 ? (
              <div className="text-center py-16 text-xs text-base-content/30 italic">No trend data available.</div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthly_trend} margin={{ left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month_name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Repair Cost']} />
                    <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType="EXPENSE_REPORT"
        reportName="Cost & Expense Report"
      />
    </div>
  );
};

export default ExpenseReport;
