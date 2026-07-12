import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markRead, 
    markAllRead,
    requestBrowserPermission 
  } = useNotifications({ limit: 5 });

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Request notification permission if they click the bell
    requestBrowserPermission();
  };

  return (
    <div className="relative">
      <button 
        onClick={handleToggle}
        className={`btn btn-ghost btn-circle btn-sm transition-all duration-200 ${
          isOpen ? 'bg-base-200 text-primary' : 'text-base-content/70 hover:text-base-content'
        }`}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="badge badge-error badge-xs absolute top-0.5 right-0.5 text-white border-none py-0 px-1 font-extrabold text-[8px] min-w-[14px] min-h-[14px] flex items-center justify-center shadow shadow-error/20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown 
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setIsOpen(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />
      )}
    </div>
  );
};
export default NotificationBell;
