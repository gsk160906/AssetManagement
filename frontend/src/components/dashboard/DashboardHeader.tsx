import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardHeaderProps {
  range: string;
  onRangeChange: (range: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ range, onRangeChange, onRefresh, isRefreshing = false }) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-300/60 pb-5">
      <div>
        <h1 className="text-2xl font-bold text-base-content tracking-tight">
          {getGreeting()}, <span className="text-primary">{user?.name || 'User'}</span>
        </h1>
        <p className="text-xs text-base-content/50 mt-1 flex items-center gap-1.5 font-medium">
          <Calendar size={14} />
          {formatDate()} &bull; <span className="badge badge-sm badge-outline font-semibold opacity-85 scale-90">{user?.role}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
          className="select select-sm select-bordered bg-base-100 border-base-300 font-medium text-xs rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="1y">Last Year</option>
        </select>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn btn-outline btn-sm btn-square border-base-300 hover:bg-base-200"
          title="Refresh Dashboard Data"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};
export default DashboardHeader;
