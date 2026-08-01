import React from 'react';
import type { ButtonProps } from './types';
import { StyledWrapper } from './Button.styles';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  href,
  ...props 
}: ButtonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isDisabled = disabled || isLoading;

  if (href) {
    return (
      <StyledWrapper $variant={variant} $size={size} $disabled={isDisabled} className={className}>
        <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {isLoading && <span className="spinner"></span>}
          {children}
        </a>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper $variant={variant} $size={size} $disabled={isDisabled} className={className}>
      <button disabled={isDisabled} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {isLoading && <span className="spinner"></span>}
        {children}
      </button>
    </StyledWrapper>
  );
}
