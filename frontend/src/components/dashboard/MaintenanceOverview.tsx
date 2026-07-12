import React from 'react';
import { Wrench, CircleDollarSign } from 'lucide-react';

interface MaintenanceSummary {
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  avgRepairCost: number;
  totalCost: number;
}

interface MaintenanceOverviewProps {
  summary: MaintenanceSummary | null;
}

export const MaintenanceOverview: React.FC<MaintenanceOverviewProps> = ({ summary }) => {
  const pending = summary?.pending || 0;
  const inProgress = summary?.inProgress || 0;
  const resolved = summary?.resolved || 0;
  const rejected = summary?.rejected || 0;
  const totalTickets = pending + inProgress + resolved + rejected;

  const getPercent = (value: number) => {
    if (totalTickets === 0) return 0;
    return Math.round((value / totalTickets) * 100);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[400px]">
      <h3 className="text-sm font-bold text-base-content/80 mb-4 flex items-center gap-2">
        <Wrench size={16} className="text-primary" />
        Maintenance Overview
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-base-200/50 rounded-xl flex flex-col">
          <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Total Expense</span>
          <span className="text-base font-extrabold text-base-content mt-1 flex items-center gap-1">
            <CircleDollarSign size={14} className="text-error" />
            {formatCurrency(summary?.totalCost || 0)}
          </span>
        </div>
        <div className="p-3 bg-base-200/50 rounded-xl flex flex-col">
          <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Avg Ticket Cost</span>
          <span className="text-base font-extrabold text-base-content mt-1">
            {formatCurrency(summary?.avgRepairCost || 0)}
          </span>
        </div>
      </div>

      <div className="space-y-4 flex-1 justify-center flex flex-col">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-base-content/70">Pending Requests</span>
            <span className="text-base-content/50">{pending} ({getPercent(pending)}%)</span>
          </div>
          <progress className="progress progress-warning w-full animate-pulse-slow" value={pending} max={totalTickets || 100}></progress>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-base-content/70">In Progress</span>
            <span className="text-base-content/50">{inProgress} ({getPercent(inProgress)}%)</span>
          </div>
          <progress className="progress progress-info w-full" value={inProgress} max={totalTickets || 100}></progress>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-base-content/70">Resolved</span>
            <span className="text-base-content/50">{resolved} ({getPercent(resolved)}%)</span>
          </div>
          <progress className="progress progress-success w-full" value={resolved} max={totalTickets || 100}></progress>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-base-content/70">Rejected / Cancelled</span>
            <span className="text-base-content/50">{rejected} ({getPercent(rejected)}%)</span>
          </div>
          <progress className="progress progress-error w-full" value={rejected} max={totalTickets || 100}></progress>
        </div>
      </div>
    </div>
  );
};
export default MaintenanceOverview;
