import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-base-100/30 border border-base-300/40 rounded-2xl p-5 flex items-center gap-4 h-24">
            <div className="w-12 h-12 bg-base-300/50 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-base-300/50 rounded w-2/3"></div>
              <div className="h-6 bg-base-300/50 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-base-100/30 border border-base-300/40 rounded-2xl p-5 h-28 space-y-3">
        <div className="h-4 bg-base-300/50 rounded w-1/6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-base-300/50 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Grid: Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-base-100/30 border border-base-300/40 rounded-2xl p-5 h-[320px] space-y-4">
            <div className="h-4 bg-base-300/50 rounded w-1/2"></div>
            <div className="w-full h-44 bg-base-300/30 rounded-xl flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-base-300/50 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Tables & Sidebars Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-base-100/30 border border-base-300/40 rounded-2xl p-5 h-[400px] space-y-4">
            <div className="h-4 bg-base-300/50 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex gap-3 items-center">
                  <div className="w-8 h-8 bg-base-300/50 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-base-300/50 rounded w-3/4"></div>
                    <div className="h-2.5 bg-base-300/30 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DashboardSkeleton;
