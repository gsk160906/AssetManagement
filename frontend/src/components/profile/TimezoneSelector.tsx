import React from 'react';
import { Clock } from 'lucide-react';

interface TimezoneSelectorProps {
  value: string;
  onChange: (tz: string) => void;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ value, onChange }) => {
  const timezones = [
    { code: 'UTC', name: 'Coordinated Universal Time (UTC)' },
    { code: 'America/New_York', name: 'Eastern Time (New York)' },
    { code: 'America/Chicago', name: 'Central Time (Chicago)' },
    { code: 'America/Denver', name: 'Mountain Time (Denver)' },
    { code: 'America/Los_Angeles', name: 'Pacific Time (Los Angeles)' },
    { code: 'Europe/London', name: 'Greenwich Mean Time (London)' },
    { code: 'Europe/Paris', name: 'Central European Time (Paris)' },
    { code: 'Asia/Kolkata', name: 'India Standard Time (Kolkata)' },
    { code: 'Asia/Tokyo', name: 'Japan Standard Time (Tokyo)' },
    { code: 'Australia/Sydney', name: 'Australian Eastern Time (Sydney)' }
  ];

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
        <Clock size={15} />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full pl-10 rounded-xl text-sm select-sm"
      >
        {timezones.map((tz) => (
          <option key={tz.code} value={tz.code}>
            {tz.name}
          </option>
        ))}
      </select>
    </div>
  );
};
export default TimezoneSelector;
