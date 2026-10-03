import React, { useState } from 'react';
import { CurrencyCode } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';

export interface AreaSeries {
  id: string;
  name: string;
  color: string;
  data: number[]; // parallel to xLabels
}

interface SvgLineAreaChartProps {
  xLabels: string[];
  series: AreaSeries[];
  currency: CurrencyCode;
  height?: number;
  yAxisFormatter?: (val: number) => string;
}

export const SvgLineAreaChart: React.FC<SvgLineAreaChartProps> = ({
  xLabels,
  series,
  currency,
  height = 240,
  yAxisFormatter,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!xLabels.length || !series.length) {
    return (
      <div
        className="flex items-center justify-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-slate-200"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  // Calculate bounds
  let maxVal = 0;
  series.forEach((s) => {
    s.data.forEach((v) => {
      if (v > maxVal) maxVal = v;
    });
  });
  if (maxVal === 0) maxVal = 100;

  // Add 10% headroom
  const yMax = maxVal * 1.1;

  const width = 640;
  const padding = { top: 20, right: 24, bottom: 32, left: 64 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) =>
    padding.left + (idx / Math.max(1, xLabels.length - 1)) * graphWidth;

  const getY = (val: number) =>
    padding.top + graphHeight - (Math.max(0, val) / yMax) * graphHeight;

  // Build grid lines
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => (yMax / gridSteps) * i);

  // Filter X-axis labels to avoid crowding (at most 6-8 labels)
  const step = Math.max(1, Math.floor(xLabels.length / 6));

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={`grad-${s.id}`}
                id={`grad-${s.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines & Y labels */}
          {gridValues.map((val, idx) => {
            const y = getY(val);
            const label = yAxisFormatter
              ? yAxisFormatter(val)
              : formatCurrency(val, currency, false);

            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 font-mono text-[10px] tabular-nums"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Area and Line paths */}
          {series.map((s) => {
            if (!s.data.length) return null;

            // Area path
            const areaPoints = s.data.map((val, idx) => `${getX(idx)},${getY(val)}`);
            const areaPath = `M ${getX(0)},${getY(0)} L ${areaPoints.join(' L ')} L ${getX(s.data.length - 1)},${getY(0)} Z`;

            // Line path
            const linePath = `M ${areaPoints.join(' L ')}`;

            return (
              <g key={s.id}>
                <path d={areaPath} fill={`url(#grad-${s.id})`} />
                <path
                  d={linePath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* X axis labels */}
          {xLabels.map((lbl, idx) => {
            if (idx % step !== 0 && idx !== xLabels.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {lbl}
              </text>
            );
          })}

          {/* Hover tracker line */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + graphHeight}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              {series.map((s) => {
                const val = s.data[hoveredIndex] || 0;
                return (
                  <circle
                    key={s.id}
                    cx={getX(hoveredIndex)}
                    cy={getY(val)}
                    r="4"
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}

          {/* Transparent interactive columns for hover */}
          {xLabels.map((_, idx) => {
            const colWidth = graphWidth / Math.max(1, xLabels.length);
            const x = getX(idx) - colWidth / 2;
            return (
              <rect
                key={idx}
                x={x}
                y={padding.top}
                width={colWidth}
                height={graphHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>
      </div>

      {/* Tooltip or Series Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100">
        <div className="flex items-center gap-4">
          {series.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600">{s.name}</span>
            </div>
          ))}
        </div>

        {hoveredIndex !== null && (
          <div className="flex items-center gap-3 font-mono tabular-nums text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            <span className="font-semibold text-slate-900">{xLabels[hoveredIndex]}:</span>
            {series.map((s) => (
              <span key={s.id} style={{ color: s.color }}>
                {s.name}: {formatCurrency(s.data[hoveredIndex] || 0, currency)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
