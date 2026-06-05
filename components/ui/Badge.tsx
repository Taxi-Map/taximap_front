import React from 'react';

type BadgeColor = 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  blue: 'bg-blue-horizon/20 text-blue-atlantic',
  amber: 'bg-amber-light text-amber-dark',
  green: 'bg-success-bg text-success',
  red: 'bg-error-bg text-error',
  purple: 'bg-purple-100 text-purple-700',
  slate: 'bg-slate-100 text-slate-dark',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'slate',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${colorMap[color]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
