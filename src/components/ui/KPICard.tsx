import React from 'react';
import { SparkLineChart } from './SparkLineChart';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  safeRange?: string;
  status: 'safe' | 'warning' | 'critical' | 'info';
  icon: React.ReactNode;
  trend?: number[];
  lastUpdated?: Date;
  subtitle?: string;
}

const STATUS_COLORS = {
  safe: { border: 'border-mine-green/30', text: 'text-mine-green', label: 'SAFE', bg: 'bg-mine-green/5' },
  warning: { border: 'border-mine-yellow/30', text: 'text-mine-yellow', label: 'WARNING', bg: 'bg-mine-yellow/5' },
  critical: { border: 'border-mine-red/30', text: 'text-mine-red', label: 'CRITICAL', bg: 'bg-mine-red/5' },
  info: { border: 'border-mine-cyan/30', text: 'text-mine-cyan', label: 'NORMAL', bg: 'bg-mine-cyan/5' },
};

export function KPICard({ title, value, unit, safeRange, status, icon, trend, lastUpdated, subtitle }: KPICardProps) {
  const cfg = STATUS_COLORS[status];
  return (
    <div className={`bg-mine-panel border ${cfg.border} rounded p-3 flex flex-col gap-2 relative overflow-hidden`}>
      <div className={`absolute inset-0 ${cfg.bg} pointer-events-none`} />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`${cfg.text} flex-shrink-0`}>{icon}</div>
          <div>
            <div className="text-[11px] text-mine-subtext font-medium uppercase tracking-wider leading-none">{title}</div>
            {safeRange && <div className="text-[9px] text-mine-muted mt-0.5">Safe: {safeRange}</div>}
          </div>
        </div>
        <span className={`text-[9px] font-bold tracking-widest ${cfg.text} border ${cfg.border} rounded px-1.5 py-0.5`}>
          {cfg.label}
        </span>
      </div>
      <div className="relative flex items-end justify-between">
        <div>
          <div className="font-mono text-2xl font-bold text-mine-text leading-none">
            {typeof value === 'number' ? value.toFixed(value >= 100 ? 0 : 1) : value}
            <span className="text-sm font-normal text-mine-subtext ml-1">{unit}</span>
          </div>
          {subtitle && <div className="text-[10px] text-mine-subtext mt-1">{subtitle}</div>}
        </div>
        {trend && trend.length > 1 && (
          <SparkLineChart data={trend} color={cfg.text.replace('text-', '')} />
        )}
      </div>
      {lastUpdated && (
        <div className="relative text-[9px] text-mine-muted">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
