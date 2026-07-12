import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 py-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card bg-base-100/40 border border-base-300/40 p-4 rounded-xl flex flex-row items-start gap-4 animate-pulse">
          <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <div className="skeleton h-3.5 w-1/3 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="flex gap-2 pt-1">
              <div className="skeleton h-4 w-12 rounded-lg" />
              <div className="skeleton h-4 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default NotificationSkeleton;
