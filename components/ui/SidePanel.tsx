
import React, { ReactNode, useEffect } from 'react';
import { Button } from './Button';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    md: 'w-full sm:w-1/2 md:w-2/5 lg:w-1/3',
    lg: 'w-full sm:w-3/5 md:w-1/2 lg:w-2/5',
    xl: 'w-full sm:w-4/5 md:w-3/5 lg:w-1/2',
};

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      aria-labelledby="side-panel-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${sizeClasses[size]} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {title && (
          <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
            <h2 id="side-panel-title" className="text-xl font-semibold text-gray-800">
              {title}
            </h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-1"
              aria-label="Закрыть"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        )}
        
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
            <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
        )}
      </div>
    </div>
  );
};
