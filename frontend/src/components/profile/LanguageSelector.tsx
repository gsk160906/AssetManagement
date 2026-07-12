import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  const languages = [
    { code: 'English', name: 'English (US)' },
    { code: 'Spanish', name: 'Español' },
    { code: 'French', name: 'Français' },
    { code: 'German', name: 'Deutsch' }
  ];

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
        <Globe size={15} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full pl-10 rounded-xl text-sm select-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
export default LanguageSelector;
