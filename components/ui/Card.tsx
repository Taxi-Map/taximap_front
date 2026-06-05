import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-card ${paddings[padding]} ${
        hover ? 'hover:shadow-card-hover hover:border-blue-sky/30 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
