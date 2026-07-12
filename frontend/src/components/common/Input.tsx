import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="form-control w-full">
        {label && (
          <label className="label py-1">
            <span className="label-text font-medium text-base-content/80 text-sm">{label}</span>
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-base-content/50 flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`input input-bordered w-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${
              error ? 'input-error' : ''
            } ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <label className="label py-1">
            <span className={`label-text-alt ${error ? 'text-error font-medium' : 'text-base-content/60'}`}>
              {error || helperText}
            </span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
