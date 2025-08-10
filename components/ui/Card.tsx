import React, { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, actions, ...props }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`} {...props}>
      {(title || actions) && (
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          {title && <h3 className="text-lg leading-6 font-semibold text-gray-900">{title}</h3>}
          {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};
