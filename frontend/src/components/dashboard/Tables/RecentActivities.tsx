import React from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

interface Activity {
  id: string;
  actor: string;
  action: string;
  module: string;
  entity: string;
  timestamp: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, page, onPageChange, isLoading = false }) => {
  const getBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'badge-info text-info-content';
      case 'ALLOCATE': return 'badge-success text-success-content';
      case 'BOOK': return 'badge-secondary text-secondary-content';
      case 'RESOLVE_TICKET': return 'badge-primary text-primary-content';
      case 'UPDATE': return 'badge-warning text-warning-content';
      default: return 'badge-ghost';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-base-content/80 flex items-center gap-2">
          <History size={16} className="text-primary" />
          Recent Activities
        </h3>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="btn btn-xs btn-outline border-base-300"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-bold px-2">{page}</span>
          <button
            disabled={activities.length < 10 || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="btn btn-xs btn-outline border-base-300"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-base-content/40">
            No recent activity logs found
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-300/40 text-base-content/40 text-[10px] uppercase">
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-base-200/30 border-b border-base-300/30 text-xs">
                    <td className="text-base-content/50 font-medium whitespace-nowrap">{formatTime(act.timestamp)}</td>
                    <td className="font-semibold text-base-content/80">{act.actor}</td>
                    <td>
                      <span className={`badge badge-sm font-bold text-[9px] uppercase px-2 ${getBadgeColor(act.action)}`}>
                        {act.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-base-content/65 font-medium">{act.module}</td>
                    <td className="text-base-content/50 font-mono text-[10px]">{act.entity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default RecentActivities;
