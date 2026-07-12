import React from 'react';

interface NotificationTabsProps {
  activeTab: 'ALL' | 'UNREAD' | 'READ';
  onChange: (tab: 'ALL' | 'UNREAD' | 'READ') => void;
  unreadCount: number;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  onChange,
  unreadCount
}) => {
  return (
    <div className="tabs tabs-boxed bg-base-200/50 p-1 rounded-xl flex gap-1 select-none">
      <button
        onClick={() => onChange('ALL')}
        className={`tab tab-sm flex-1 font-bold text-xs rounded-lg transition-all ${
          activeTab === 'ALL' ? 'tab-active bg-primary text-primary-content shadow-sm' : 'text-base-content/60'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onChange('UNREAD')}
        className={`tab tab-sm flex-1 font-bold text-xs rounded-lg transition-all gap-1.5 ${
          activeTab === 'UNREAD' ? 'tab-active bg-primary text-primary-content shadow-sm' : 'text-base-content/60'
        }`}
      >
        Unread
        {unreadCount > 0 && (
          <span className={`badge badge-xs font-extrabold ${activeTab === 'UNREAD' ? 'bg-primary-content text-primary border-none' : 'badge-primary text-white border-none'}`}>
            {unreadCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onChange('READ')}
        className={`tab tab-sm flex-1 font-bold text-xs rounded-lg transition-all ${
          activeTab === 'READ' ? 'tab-active bg-primary text-primary-content shadow-sm' : 'text-base-content/60'
        }`}
      >
        Read
      </button>
    </div>
  );
};
export default NotificationTabs;
