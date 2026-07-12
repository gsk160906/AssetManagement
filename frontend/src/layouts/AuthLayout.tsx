import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-150 dark:from-slate-950 dark:to-slate-900 transition-colors duration-200 p-4 relative overflow-hidden">
      {/* Decorative background blurs for a premium look */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md z-10">
        <Outlet />
      </div>
    </div>
  );
};
