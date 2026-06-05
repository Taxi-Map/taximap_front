import React from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
  dark?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
  dark = false,
}) => {
  if (variant === 'pills') {
    return (
      <div className={`flex ${dark ? 'bg-white/10' : 'bg-slate-100'} p-1 rounded-xl gap-0.5 ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                isActive
                  ? dark
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'bg-white text-storm shadow-sm'
                  : dark
                    ? 'text-white/50 hover:text-white hover:bg-white/10'
                    : 'text-slate-mid hover:text-storm hover:bg-white/50'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? dark
                        ? 'bg-white/20 text-white/80'
                        : 'bg-blue-horizon/20 text-blue-atlantic'
                      : dark
                        ? 'bg-white/10 text-white/40'
                        : 'bg-slate-200 text-slate-mid'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex gap-1 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-all duration-200 whitespace-nowrap shrink-0 ${
              isActive
                ? 'border-blue-atlantic text-blue-atlantic'
                : 'border-transparent text-slate-mid hover:text-storm hover:border-slate-300 hover:bg-sand/50'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-blue-atlantic text-white'
                    : 'bg-slate-200 text-slate-mid'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
