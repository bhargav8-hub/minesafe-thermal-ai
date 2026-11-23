import React from 'react';
import { RiskLevel } from '../../types';

interface StatusBadgeProps {
  level: RiskLevel | 'online' | 'offline' | 'warning';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const CONFIG = {
  safe: { color: 'text-mine-green', bg: 'bg-mine-green/10', border: 'border-mine-green/30', dot: 'bg-mine-green', label: 'Safe' },
  warning: { color: 'text-mine-yellow', bg: 'bg-mine-yellow/10', border: 'border-mine-yellow/30', dot: 'bg-mine-yellow', label: 'Warning' },
  high: { color: 'text-mine-orange', bg: 'bg-mine-orange/10', border: 'border-mine-orange/30', dot: 'bg-mine-orange', label: 'High Risk' },
  critical: { color: 'text-mine-red', bg: 'bg-mine-red/10', border: 'border-mine-red/30', dot: 'bg-mine-red', label: 'Critical' },
  online: { color: 'text-mine-green', bg: 'bg-mine-green/10', border: 'border-mine-green/30', dot: 'bg-mine-green', label: 'Online' },
  offline: { color: 'text-mine-muted', bg: 'bg-mine-muted/10', border: 'border-mine-muted/30', dot: 'bg-mine-muted', label: 'Offline' },
};

export function StatusBadge({ level, label, size = 'sm', pulse = false }: StatusBadgeProps) {
  const cfg = CONFIG[level] || CONFIG.safe;
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium ${cfg.bg} ${cfg.border} ${cfg.color} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {label ?? cfg.label}
    </span>
  );
}
