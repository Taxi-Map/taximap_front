import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-atlantic text-white hover:bg-blue-atlantic/90 shadow-button hover:shadow-[0_8px_24px_rgba(46,107,158,0.35)] active:scale-[0.97]',
  secondary:
    'bg-white text-storm border-2 border-slate-200 hover:border-blue-sky hover:text-blue-atlantic hover:shadow-[0_4px_16px_rgba(46,107,158,0.12)] active:scale-[0.97]',
  ghost:
    'text-slate-mid hover:text-storm hover:bg-sand hover:shadow-sm active:scale-[0.97]',
  danger:
    'bg-error text-white hover:bg-error/90 hover:shadow-[0_4px_16px_rgba(239,68,68,0.3)] active:scale-[0.97]',
  amber:
    'bg-amber-warm text-blue-deep hover:bg-amber-warm/90 shadow-[0_4px_14px_rgba(244,162,97,0.3)] hover:shadow-[0_8px_24px_rgba(244,162,97,0.4)] active:scale-[0.97] font-bold',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-3 text-sm rounded-xl gap-2',
  lg: 'px-6 py-4 text-base rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-sky focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
