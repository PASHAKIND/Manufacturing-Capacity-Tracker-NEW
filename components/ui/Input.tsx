
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, className = '', wrapperClassName = 'w-full', ...props }, ref) => {
    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref} // Forward the ref to the input element
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${error ? 'border-gray-600' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-gray-700">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input'; // Optional: for better debugging display names

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={3}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${error ? 'border-gray-600' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-gray-700">{error}</p>}
    </div>
  );
};
