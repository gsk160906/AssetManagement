import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  Settings, 
  Shield, 
  ArrowLeftRight, 
  Trash2, 
  Check, 
  CheckCheck,
  Clock,
  ArrowRight,
  Bell
} from 'lucide-react';
import type { Notification } from '../../types/notification';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ASSET: <Package size={16} />,
  MAINTENANCE: <Wrench size={16} />,
  BOOKING: <Calendar size={16} />,
  AUDIT: <ClipboardCheck size={16} />,
  REPORT: <FileText size={16} />,
  SYSTEM: <Settings size={16} />,
  SECURITY: <Shield size={16} />,
  TRANSFER: <ArrowLeftRight size={16} />
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

const PRIORITY_BADGES: Record<string, string> = {
  LOW: 'badge-ghost text-base-content/40',
  MEDIUM: 'badge-info text-info-content',
  HIGH: 'badge-warning text-warning-content',
  URGENT: 'badge-error text-error-content'
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete
}) => {
  const navigate = useNavigate();

  // Helper for human-readable time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleCardClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div 
      className={`card border transition-all duration-200 select-none ${
        notification.is_read 
          ? 'bg-base-100/40 border-base-300/40 opacity-75' 
          : 'bg-base-100 border-primary/20 shadow-md shadow-primary/5 hover:border-primary/40'
      }`}
    >
      <div className="p-4 flex gap-4 items-start">
        {/* Category Icon */}
        <div className={`p-2.5 rounded-xl shrink-0 ${CATEGORY_COLORS[notification.category] || 'bg-base-200 text-base-content/50'}`}>
          {CATEGORY_ICONS[notification.category] || <Bell size={16} />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1 cursor-pointer" onClick={handleCardClick}>
          <div className="flex justify-between items-start">
            <h4 className={`text-xs font-bold transition-colors ${notification.is_read ? 'text-base-content/70' : 'text-base-content hover:text-primary'}`}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-base-content/40 font-semibold flex items-center gap-1 shrink-0">
              <Clock size={10} />
              {formatTimeAgo(notification.created_at)}
            </span>
          </div>
          
          <p className="text-xs text-base-content/60 leading-relaxed break-words">
            {notification.message}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1.5 items-center">
            {/* Priority Badge */}
            <span className={`badge badge-xs font-extrabold text-[8px] tracking-wide uppercase px-1.5 py-1 ${PRIORITY_BADGES[notification.priority] || 'badge-ghost'}`}>
              {notification.priority}
            </span>

            {/* Category Tag */}
            <span className="badge badge-xs badge-ghost text-[8px] font-bold text-base-content/45 tracking-wide px-1.5 py-1">
              {notification.category}
            </span>

            {/* Action Redirect Label */}
            {notification.action_url && (
              <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 ml-auto hover:underline">
                {notification.action_label || 'View Details'} <ArrowRight size={10} />
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 items-center shrink-0 border-l border-base-300/30 pl-2">
          {notification.is_read ? (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkUnread(notification.id); }}
              className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-primary"
              title="Mark as Unread"
            >
              <Check size={13} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
              className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
              title="Mark as Read"
            >
              <CheckCheck size={13} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
            title="Delete Notification"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default NotificationCard;
