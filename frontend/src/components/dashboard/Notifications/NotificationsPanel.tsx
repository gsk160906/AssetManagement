import React from 'react';
import { Bell, ShieldAlert, RefreshCw, CalendarDays, Key, Wrench } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  count: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, count, onRefresh, isLoading = false }) => {
  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ALLOCATION': return <Key size={14} className="text-success" />;
      case 'BOOKING': return <CalendarDays size={14} className="text-secondary" />;
      case 'MAINTENANCE': return <Wrench size={14} className="text-error" />;
      default: return <ShieldAlert size={14} className="text-info" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ALLOCATION': return 'badge-success text-success-content';
      case 'BOOKING': return 'badge-secondary text-secondary-content';
      case 'MAINTENANCE': return 'badge-error text-error-content';
      default: return 'badge-info text-info-content';
    }
  };

  const formatTime = (isoString: string) => {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-300/30">
        <h3 className="text-sm font-bold text-base-content/85 flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          Alerts
          {count > 0 && <span className="badge badge-error badge-sm text-white font-bold">{count}</span>}
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {notifications.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-base-content/40">
            No unread notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="flex gap-3 items-start hover:bg-base-200/20 p-2 rounded-xl transition-all duration-200">
              <div className="mt-0.5 p-2 rounded-lg bg-base-200/80 flex items-center justify-center">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-xs text-base-content/80 leading-snug">{notif.title}</h4>
                  <span className="text-[9px] text-base-content/40 whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                </div>
                <p className="text-[11px] text-base-content/60 mt-0.5 leading-relaxed">{notif.message}</p>
                <div className="mt-1.5 flex gap-1">
                  <span className={`badge text-[8px] font-extrabold uppercase scale-90 -translate-x-1 py-1 px-2 border-none ${getTypeColor(notif.type)}`}>
                    {notif.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default NotificationsPanel;
