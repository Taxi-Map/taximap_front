import type { ButtonProps } from './types';
import './Button.css'; // Optional: for bespoke styles not covered by Tailwind

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  
  // Base classes mapping Tailwind utilities to our component variants
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-colors cursor-pointer rounded-full';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light shadow-lg',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  const disabledClass = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button 
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
      ) : null}
      {children}
    </button>
  );
}
