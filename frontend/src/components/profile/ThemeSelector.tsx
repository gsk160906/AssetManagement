import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSelectorProps {
  value: 'LIGHT' | 'DARK' | 'SYSTEM';
  onChange: (theme: 'LIGHT' | 'DARK' | 'SYSTEM') => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ value, onChange }) => {
  const options = [
    { id: 'LIGHT', label: 'Light', icon: <Sun size={15} /> },
    { id: 'DARK', label: 'Dark', icon: <Moon size={15} /> },
    { id: 'SYSTEM', label: 'System', icon: <Monitor size={15} /> }
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`btn btn-sm rounded-xl text-xs flex items-center justify-center gap-2 border ${
            value === opt.id
              ? 'btn-primary border-primary'
              : 'btn-ghost border-base-300 hover:bg-base-200/50'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
};
export default ThemeSelector;
