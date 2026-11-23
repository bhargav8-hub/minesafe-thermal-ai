import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPad?: boolean;
}

export function Panel({ title, subtitle, children, className = '', headerAction, noPad }: PanelProps) {
  return (
    <div className={`bg-mine-panel border border-mine-border rounded-lg shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-mine-border/80 bg-mine-surface/50">
          <div>
            {title && <div className="text-xs font-semibold text-mine-text uppercase tracking-wider">{title}</div>}
            {subtitle && <div className="text-[10px] text-mine-subtext mt-0.5">{subtitle}</div>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPad ? '' : 'p-4'}`}>{children}</div>
    </div>
  );
}
