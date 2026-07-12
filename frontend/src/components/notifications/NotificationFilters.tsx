import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import type { NotificationCategory, NotificationPriority } from '../../types/notification';

interface NotificationFiltersProps {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  limit: number;
  onCategoryChange: (cat?: NotificationCategory) => void;
  onPriorityChange: (pri?: NotificationPriority) => void;
  onLimitChange: (lim: number) => void;
  onReset: () => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  category,
  priority,
  limit,
  onCategoryChange,
  onPriorityChange,
  onLimitChange,
  onReset
}) => {
  return (
    <div className="card bg-base-100/40 border border-base-300/40 p-4 rounded-2xl space-y-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-base-300/30">
        <span className="text-xs font-bold text-base-content/85 flex items-center gap-1.5">
          <Filter size={14} /> Filter Options
        </span>
        <button
          onClick={onReset}
          className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary flex items-center gap-1 normal-case font-bold text-[10px]"
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-base-content/40 uppercase">Category</label>
        <select
          value={category || ''}
          onChange={(e) => onCategoryChange(e.target.value ? (e.target.value as NotificationCategory) : undefined)}
          className="select select-xs select-bordered w-full rounded-xl text-xs font-medium"
        >
          <option value="">All Categories</option>
          <option value="ASSET">Asset Lifecycle</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="BOOKING">Bookings</option>
          <option value="AUDIT">Inventory Audits</option>
          <option value="REPORT">Reports & Export</option>
          <option value="SYSTEM">System Updates</option>
          <option value="SECURITY">Security alerts</option>
          <option value="TRANSFER">Asset Transfer</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-base-content/40 uppercase">Priority</label>
        <select
          value={priority || ''}
          onChange={(e) => onPriorityChange(e.target.value ? (e.target.value as NotificationPriority) : undefined)}
          className="select select-xs select-bordered w-full rounded-xl text-xs font-medium"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Page Size Filter */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-base-content/40 uppercase">Items Per Page</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
          className="select select-xs select-bordered w-full rounded-xl text-xs font-medium"
        >
          <option value={10}>10 Items</option>
          <option value={20}>20 Items</option>
          <option value={50}>50 Items</option>
        </select>
      </div>
    </div>
  );
};
export default NotificationFilters;
