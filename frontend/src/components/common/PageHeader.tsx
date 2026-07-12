import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-base-300">
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="text-xs breadcrumbs text-base-content/50 p-0 mb-1">
            <ul className="flex items-center space-x-1.5">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center">
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-primary transition-colors font-medium">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-base-content/80 font-normal">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-base-content">{title}</h1>
        {subtitle && <p className="text-sm text-base-content/65">{subtitle}</p>}
      </div>
      {action && (
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          {action}
        </div>
      )}
    </div>
  );
};
