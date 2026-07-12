import React from 'react';
import { Card } from '../common/Card';
import { Bell } from 'lucide-react';

interface PreferenceOption {
  key: string;
  label: string;
  desc: string;
  checked: boolean;
}

interface PreferencesCardProps {
  title: string;
  options: PreferenceOption[];
  onToggle: (key: any) => void;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({ title, options, onToggle }) => {
  return (
    <Card title={title} className="bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-6">
      <div className="space-y-4">
        {options.map((cat) => (
          <div key={cat.key} className="flex justify-between items-center py-2 [&:not(:first-child)]:border-t border-base-300/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-base-200 text-primary">
                <Bell size={16} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-base-content">{cat.label}</h4>
                <p className="text-[10px] text-base-content/40">{cat.desc}</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              className="toggle toggle-primary toggle-sm" 
              checked={cat.checked}
              onChange={() => onToggle(cat.key)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
export default PreferencesCard;
