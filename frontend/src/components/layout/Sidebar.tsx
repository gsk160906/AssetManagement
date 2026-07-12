import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_NAVIGATION } from '../../constants/sidebar';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full w-64 bg-base-100 border-r border-base-300 select-none">
      {/* Branding */}
      <div className="flex items-center space-x-2.5 px-6 py-5 border-b border-base-300">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-primary/20">
          A
        </div>
        <span className="text-xl font-bold tracking-tight text-base-content">
          Asset<span className="text-primary font-extrabold">Flow</span>
        </span>
      </div>

      {/* Navigation list mapped from constants/sidebar.ts */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {SIDEBAR_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/15'
                  : 'text-base-content/75 hover:bg-base-200 hover:text-base-content'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-base-content/50'} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-base-300 bg-base-200/20 text-center">
        <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider">
          AssetFlow ERP v1.0.0
        </span>
      </div>
    </div>
  );
};
