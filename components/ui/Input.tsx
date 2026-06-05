import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-mid uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-mid">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3.5 bg-sand border-2 border-slate-200 rounded-xl text-storm font-medium placeholder:text-slate-light transition-all duration-200 outline-none focus:border-blue-sky focus:bg-white focus:shadow-[0_0_0_4px_rgba(109,183,226,0.1)] ${icon ? 'pl-12' : ''} ${rightIcon ? 'pr-12' : ''} ${error ? 'border-error focus:border-error' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
