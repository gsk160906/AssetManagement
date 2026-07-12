import React from 'react';

interface StatCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClass?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

const colorMaps = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
  accent: { bg: 'bg-accent/10', text: 'text-accent' },
  info: { bg: 'bg-info/10', text: 'text-info' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  error: { bg: 'bg-error/10', text: 'text-error' },
};

export const StatCard: React.FC<StatCardProps> = ({ title, count, icon, trend, colorClass = 'primary' }) => {
  const mapping = colorMaps[colorClass] || colorMaps.primary;

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl p-5 flex flex-row items-center gap-4 group">
      <div className={`p-4 rounded-xl ${mapping.bg} ${mapping.text} group-hover:scale-105 transition-all duration-300`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">{title}</h4>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-extrabold text-base-content tracking-tight">{count}</span>
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default StatCard;
