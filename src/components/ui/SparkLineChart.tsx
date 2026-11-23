import React from 'react';

interface SparkLineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function SparkLineChart({ data, color = 'cyan', width = 80, height = 32 }: SparkLineChartProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const colorMap: Record<string, string> = {
    'cyan': '#06b6d4',
    'green': '#22c55e',
    'yellow': '#eab308',
    'red': '#ef4444',
    'orange': '#f97316',
    'blue': '#3b82f6',
    'mine-cyan': '#06b6d4',
    'mine-green': '#22c55e',
    'mine-yellow': '#eab308',
    'mine-red': '#ef4444',
    'mine-orange': '#f97316',
  };
  const cleanColor = color.replace('text-', '');
  const strokeColor = colorMap[cleanColor] || '#06b6d4';
  const gradId = `spark-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} className="flex-shrink-0 overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts.join(' ')} ${width},${height}`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.length > 0 && (() => {
        const last = pts[pts.length - 1].split(',');
        return <circle cx={last[0]} cy={last[1]} r="2.5" fill={strokeColor} />;
      })()}
    </svg>
  );
}
