import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  Settings, 
  Shield, 
  ArrowLeftRight, 
  Clock, 
  Bell 
} from 'lucide-react';
import type { Notification } from '../../types/notification';
import { NotificationEmpty } from './NotificationEmpty';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ASSET: <Package size={14} />,
  MAINTENANCE: <Wrench size={14} />,
  BOOKING: <Calendar size={14} />,
  AUDIT: <ClipboardCheck size={14} />,
  REPORT: <FileText size={14} />,
  SYSTEM: <Settings size={14} />,
  SECURITY: <Shield size={14} />,
  TRANSFER: <ArrowLeftRight size={14} />
};

const CATEGORY_COLORS: Record<string, string> = {
  ASSET: 'bg-primary/10 text-primary',
  MAINTENANCE: 'bg-warning/10 text-warning',
  BOOKING: 'bg-info/10 text-info',
  AUDIT: 'bg-success/10 text-success',
  REPORT: 'bg-secondary/10 text-secondary',
  SYSTEM: 'bg-accent/10 text-accent',
  SECURITY: 'bg-error/10 text-error',
  TRANSFER: 'bg-primary/10 text-primary'
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onClose,
  onMarkRead,
  onMarkAllRead
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) {
      onMarkRead(n.id);
    }
    onClose();
    if (n.action_url) {
      navigate(n.action_url);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={dropdownRef} 
      className="absolute right-0 mt-3 z-50 w-[360px] md:w-[380px] bg-base-100 border border-base-300 rounded-2xl shadow-xl p-0 overflow-hidden select-none animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-primary" />
          <span className="font-bold text-xs text-base-content/85">Recent Alerts</span>
          {unreadCount > 0 && (
            <span className="badge badge-primary text-white badge-xs font-bold px-1.5 py-1 scale-90">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-base-300/30">
        {notifications.length === 0 ? (
          <NotificationEmpty />
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div 
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 flex gap-3 hover:bg-base-200/40 transition-colors cursor-pointer items-start ${
                !n.is_read ? 'bg-primary/5' : ''
              }`}
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg shrink-0 ${CATEGORY_COLORS[n.category] || 'bg-base-200 text-base-content/40'}`}>
                {CATEGORY_ICONS[n.category] || <Bell size={12} />}
              </div>

              {/* Body */}
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs truncate font-bold ${!n.is_read ? 'text-base-content font-extrabold' : 'text-base-content/70'}`}>
                    {n.title}
                  </p>
                  <span className="text-[9px] text-base-content/40 font-semibold shrink-0 flex items-center gap-0.5">
                    <Clock size={8} /> {formatTimeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-[11px] text-base-content/65 leading-relaxed line-clamp-2 break-words">
                  {n.message}
                </p>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm shadow-primary/30" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <Link 
        to="/notifications" 
        onClick={onClose}
        className="block text-center py-2.5 bg-base-200/20 hover:bg-base-200/50 text-[10px] font-bold text-primary uppercase tracking-wider border-t border-base-300"
      >
        View All Alerts
      </Link>
    </div>
  );
};
export default NotificationDropdown;
