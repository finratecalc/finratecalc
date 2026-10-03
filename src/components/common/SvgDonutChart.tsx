import React, { useState } from 'react';
import { CurrencyCode } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface SvgDonutChartProps {
  slices: DonutSlice[];
  currency: CurrencyCode;
  title?: string;
  size?: number;
}

export const SvgDonutChart: React.FC<SvgDonutChartProps> = ({
  slices,
  currency,
  title,
  size = 240,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const radius = size * 0.38;
  const strokeWidth = size * 0.16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4">
      {/* SVG Container */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Base empty ring if zero */}
          {total <= 0 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          ) : (
            slices.map((slice, idx) => {
              if (slice.value <= 0) return null;
              const slicePercent = slice.value / total;
              const strokeDasharray = `${circumference * slicePercent} ${circumference * (1 - slicePercent)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += slicePercent;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {hoveredIdx !== null ? slices[hoveredIdx].label : title || 'Total'}
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {hoveredIdx !== null
              ? formatCurrency(slices[hoveredIdx].value, currency)
              : formatCurrency(total, currency, false)}
          </span>
          {hoveredIdx !== null && total > 0 && (
            <span className="text-xs text-slate-500 font-mono">
              {((slices[hoveredIdx].value / total) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {slices.map((slice, idx) => {
          const percent = total > 0 ? (slice.value / total) * 100 : 0;
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                isHovered ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-slate-700 truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-right">
                <span className="text-slate-900 font-medium">
                  {formatCurrency(slice.value, currency)}
                </span>
                <span className="text-slate-500 w-10 text-right">
                  {percent.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
