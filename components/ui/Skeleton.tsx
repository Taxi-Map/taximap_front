import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'block';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
}) => {
  const baseClass = 'skeleton-shimmer rounded';

  if (variant === 'circle') {
    const size = width || height || 40;
    return (
      <div
        className={`${baseClass} shrink-0 rounded-full ${className}`}
        style={{ width: typeof size === 'number' ? size : size, height: typeof size === 'number' ? size : size }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`${baseClass} rounded-2xl ${className}`}
        style={{ width: width || '100%', height: height || 120 }}
      />
    );
  }

  if (variant === 'block') {
    return (
      <div
        className={`${baseClass} rounded-xl ${className}`}
        style={{ width: width || '100%', height: height || 40 }}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} h-3`}
          style={{
            width: i === lines - 1 && lines > 1 ? '60%' : width || '100%',
            height: height || 12,
          }}
        />
      ))}
    </div>
  );
};

export const SkeletonCardItem: React.FC<{ count?: number; dark?: boolean }> = ({ count = 3, dark }) => {
  const bg = dark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100';
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${bg} rounded-2xl p-4 border flex items-start justify-between gap-3`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton variant="block" width={40} height={40} className="shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="skeleton-shimmer h-4 rounded" style={{ width: '70%' }} />
              <div className="skeleton-shimmer h-3 rounded" style={{ width: '45%' }} />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="skeleton-shimmer rounded-lg" style={{ width: 72, height: 32 }} />
            <div className="skeleton-shimmer rounded-lg" style={{ width: 72, height: 32 }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonStatCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
    <div className="skeleton-shimmer rounded-lg mx-auto mb-2" style={{ width: 64, height: 36 }} />
    <div className="skeleton-shimmer rounded h-3 mx-auto" style={{ width: '60%' }} />
  </div>
);

export const SkeletonContributionRow: React.FC = () => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
    <div className="flex items-center gap-3 flex-1">
      <Skeleton variant="block" width={40} height={40} />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton-shimmer rounded h-4" style={{ width: '55%' }} />
        <div className="flex gap-2">
          <div className="skeleton-shimmer rounded h-3" style={{ width: 80 }} />
          <div className="skeleton-shimmer rounded h-3" style={{ width: 50 }} />
        </div>
      </div>
    </div>
    <div className="text-right space-y-1">
      <div className="skeleton-shimmer rounded h-3 ml-auto" style={{ width: 50 }} />
      <div className="skeleton-shimmer rounded h-3 ml-auto" style={{ width: 60 }} />
    </div>
  </div>
);

export const SkeletonRouteCard: React.FC = () => (
  <div className="p-4 rounded-2xl border-2 border-white/10 bg-white/5">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="skeleton-shimmer rounded h-4 bg-white/10" style={{ width: 60 }} />
          <div className="skeleton-shimmer rounded h-4 bg-white/10" style={{ width: 70 }} />
        </div>
        <div className="skeleton-shimmer rounded h-4 bg-white/10" style={{ width: '80%' }} />
        <div className="skeleton-shimmer rounded h-3 bg-white/10" style={{ width: '55%' }} />
      </div>
      <div className="skeleton-shimmer rounded-xl bg-white/10 shrink-0 ml-3" style={{ width: 40, height: 40 }} />
    </div>
  </div>
);
