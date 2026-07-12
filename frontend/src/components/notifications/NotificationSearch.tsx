import React from 'react';
import { Search, X } from 'lucide-react';

interface NotificationSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const NotificationSearch: React.FC<NotificationSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-2.5 text-base-content/40">
        <Search size={14} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search notifications by title, message..."
        className="input input-sm input-bordered w-full pl-9 pr-8 bg-base-200/40 text-xs rounded-xl focus:bg-base-100 transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary border-base-300"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-2.5 text-base-content/30 hover:text-base-content/60"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};
export default NotificationSearch;
