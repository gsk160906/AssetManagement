import React from 'react';
import { BellOff } from 'lucide-react';

interface NotificationEmptyProps {
  title?: string;
  message?: string;
}

export const NotificationEmpty: React.FC<NotificationEmptyProps> = ({
  title = 'No Notifications',
  message = "You're all caught up."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center select-none">
      <div className="p-4 bg-base-200/50 text-base-content/30 rounded-2xl mb-4 shadow-inner">
        <BellOff size={36} />
      </div>
      <h3 className="text-sm font-bold text-base-content/80">{title}</h3>
      <p className="text-xs text-base-content/40 mt-1 max-w-xs">{message}</p>
    </div>
  );
};
export default NotificationEmpty;
