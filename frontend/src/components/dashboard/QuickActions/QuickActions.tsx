import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, CalendarDays, ArrowLeftRight, Wrench, Shield } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    { label: 'View Assets', icon: <Monitor size={18} />, path: '/assets', color: 'primary' },
    { label: 'Book Resource', icon: <CalendarDays size={18} />, path: '/bookings', color: 'secondary' },
    { label: 'Transfer Asset', icon: <ArrowLeftRight size={18} />, path: '/allocations', color: 'accent' },
    { label: 'Raise Maintenance', icon: <Wrench size={18} />, path: '/maintenance', color: 'error' },
  ];

  const colorMaps = {
    primary: 'btn-primary hover:bg-primary/90 shadow-primary/20',
    secondary: 'btn-secondary hover:bg-secondary/90 shadow-secondary/20',
    accent: 'btn-accent hover:bg-accent/90 shadow-accent/20',
    error: 'btn-error hover:bg-error/90 shadow-error/20',
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5">
      <h3 className="text-sm font-bold text-base-content/80 mb-4 flex items-center gap-2">
        <Shield size={16} className="text-primary" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((act, index) => {
          const btnColor = colorMaps[act.color as keyof typeof colorMaps] || colorMaps.primary;
          return (
            <Link key={index} to={act.path} className="w-full">
              <button className={`btn ${btnColor} w-full text-white font-semibold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl h-14 min-h-[3.5rem] shadow-md normal-case`}>
                {act.icon}
                <span>{act.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default QuickActions;
