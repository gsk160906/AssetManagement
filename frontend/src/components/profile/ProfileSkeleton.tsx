import React from 'react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-base-300 rounded-lg"></div>
        <div className="h-4 w-72 bg-base-300 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card Skeleton */}
        <div className="card border border-base-300 p-6 flex flex-col items-center bg-base-100/50">
          <div className="w-32 h-32 rounded-full bg-base-300 mb-4"></div>
          <div className="h-5 w-32 bg-base-300 rounded mb-2"></div>
          <div className="h-4 w-20 bg-base-300 rounded mb-4"></div>
          <div className="divider w-full my-4"></div>
          <div className="w-full space-y-2">
            <div className="h-8 bg-base-300 rounded-xl"></div>
            <div className="h-8 bg-base-300 rounded-xl"></div>
            <div className="h-8 bg-base-300 rounded-xl"></div>
          </div>
        </div>

        {/* Right Details Skeleton */}
        <div className="card md:col-span-2 border border-base-300 p-6 bg-base-100/50 space-y-6">
          <div className="h-5 w-40 bg-base-300 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-base-300 rounded"></div>
                <div className="h-5 w-44 bg-base-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileSkeleton;
