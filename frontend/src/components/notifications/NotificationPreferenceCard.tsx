import React from 'react';

interface NotificationPreferenceCardProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
  icon: React.ReactNode;
}

export const NotificationPreferenceCard: React.FC<NotificationPreferenceCardProps> = ({
  label,
  description,
  enabled,
  onChange,
  icon
}) => {
  return (
    <div className="card bg-base-100/40 border border-base-300/40 p-4 rounded-xl flex flex-row items-center gap-4 select-none hover:border-base-300 transition-all">
      <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-base-content/85">{label}</h4>
        <p className="text-[10px] text-base-content/40 leading-relaxed truncate mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle toggle-primary toggle-sm"
        />
      </div>
    </div>
  );
};
export default NotificationPreferenceCard;
