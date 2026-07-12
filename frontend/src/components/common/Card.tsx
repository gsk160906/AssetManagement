import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  extra,
  children,
  footer,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`card bg-base-100 border border-base-300 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md duration-200 ${className}`}>
      {(title || extra) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          {title && (
            <div className="font-semibold text-base md:text-lg text-base-content">
              {title}
            </div>
          )}
          {extra && <div className="flex items-center space-x-2">{extra}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3 bg-base-200/30 border-t border-base-300 flex justify-end space-x-2">
          {footer}
        </div>
      )}
    </div>
  );
};
