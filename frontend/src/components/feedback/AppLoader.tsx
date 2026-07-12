import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const AppLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100/90 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/20">A</div>
          <span className="text-2xl font-bold tracking-tight text-base-content">
            Asset<span className="text-primary font-extrabold">Flow</span>
          </span>
        </div>
        <LoadingSpinner size="md" variant="primary" />
        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 animate-pulse">
          Loading system resources
        </p>
      </div>
    </div>
  );
};
