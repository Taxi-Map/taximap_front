import React from 'react';
import type { ButtonProps } from './types';
import { StyledWrapper } from './Button.styles';

function normalizeHref(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('#') || 
    trimmed.startsWith('/') || 
    trimmed.startsWith('mailto:') || 
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

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
  const safeHref = normalizeHref(href);

  if (safeHref) {
    return (
      <StyledWrapper $variant={variant} $size={size} $disabled={isDisabled} className={className}>
        <a href={safeHref} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
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
