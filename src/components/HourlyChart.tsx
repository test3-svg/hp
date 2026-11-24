import { useState } from 'react';
import type { HourlyForecastPoint, TemperatureUnit } from '../types/weather';
import { formatTemp, getWeatherMeta } from '../utils/weatherApi';

interface HourlyChartProps {
  hourly: HourlyForecastPoint[];
  unit: TemperatureUnit;
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
}

export function HourlyChart({
  hourly,
  unit,
  selectedIndex,
  onSelectIndex,
}: HourlyChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const points = hourly.slice(0, 24);

  if (points.length === 0) return null;

  const temps = points.map((p) => formatTemp(p.temperature, unit));
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const tempSpan = Math.max(maxT - minT, 4);

  const width = 680;
  const height = 210;
  const padLeft = 34;
  const padRight = 18;
  const padTop = 32;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (i: number) =>
    padLeft + (i / Math.max(points.length - 1, 1)) * plotW;

  const getY = (t: number) =>
    padTop + plotH - ((t - minT) / tempSpan) * plotH;

  const coords = points.map((p, i) => ({
    x: getX(i),
    y: getY(temps[i]),
    temp: temps[i],
    prob: p.precipitationProbability,
    timeLabel: `${p.time.slice(11, 13)}시`,
    point: p,
  }));

  // Build smooth SVG cubic bezier path
  const linePath = coords.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = coords[idx - 1];
    const cx = ((prev.x + pt.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${pt.y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${
    padTop + plotH
  } L ${coords[0].x.toFixed(1)} ${padTop + plotH} Z`;

  const activeIdx = hoverIdx ?? selectedIndex;
  const activeCoord = activeIdx !== null && coords[activeIdx] ? coords[activeIdx] : null;
  const activeMeta = activeCoord
    ? getWeatherMeta(activeCoord.point.weatherCode, activeCoord.point.isDay)
    : null;

  const yTicks = [minT, Math.round((minT + maxT) / 2), maxT];

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          24시간 기온 및 강수확률 추이
        </div>
        <div className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 h-5 flex items-center gap-3">
          {activeCoord && activeMeta ? (
            <>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {activeCoord.timeLabel}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold">
                {activeCoord.temp}°{unit}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span>강수 {activeCoord.prob}%</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span className="font-sans">{activeMeta.label}</span>
            </>
          ) : (
            <span className="font-sans text-slate-400 dark:text-slate-500">
              그래프 위에 마우스를 올리면 시간별 상세 수치를 확인합니다
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none cursor-crosshair overflow-visible"
          role="img"
          aria-label="24시간 기온 및 강수확률 그래프"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal reference gridlines */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={`${tick}-${idx}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono tabular-nums"
                >
                  {tick}°
                </text>
              </g>
            );
          })}

          {/* Precipitation probability bars along bottom */}
          {coords.map((c, idx) => {
            if (c.prob <= 0) return null;
            const barMaxH = plotH * 0.34;
            const barH = (c.prob / 100) * barMaxH;
            return (
              <rect
                key={`rain-${idx}`}
                x={c.x - 4}
                y={padTop + plotH - barH}
                width={8}
                height={barH}
                rx={1.5}
                className="fill-sky-400/25 dark:fill-sky-400/20"
              />
            );
          })}

          {/* Temperature gradient area & primary spline */}
          <path d={areaPath} fill="url(#tempFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#0284C7"
            className="dark:stroke-sky-400"
            strokeWidth="2.25"
            strokeLinecap="round"
          />

          {/* X-axis 3-hour labels */}
          {coords.map((c, idx) => {
            if (idx % 3 !== 0 && idx !== coords.length - 1) return null;
            return (
              <text
                key={`xlabel-${idx}`}
                x={c.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                {c.timeLabel}
              </text>
            );
          })}

          {/* Active crosshair */}
          {activeCoord && (
            <g>
              <line
                x1={activeCoord.x}
                y1={padTop - 8}
                x2={activeCoord.x}
                y2={padTop + plotH}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-600"
                strokeWidth="1"
              />
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r={5}
                className="fill-white dark:fill-slate-900 stroke-sky-600 dark:stroke-sky-400"
                strokeWidth="2.5"
              />
              <text
                x={activeCoord.x}
                y={activeCoord.y - 12}
                textAnchor="middle"
                className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-semibold tabular-nums"
              >
                {activeCoord.temp}°
              </text>
            </g>
          )}

          {/* Invisible hover columns for snappy interaction */}
          {coords.map((c, idx) => {
            const colW = plotW / Math.max(coords.length - 1, 1);
            return (
              <rect
                key={`hit-${idx}`}
                x={c.x - colW / 2}
                y={0}
                width={colW}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(idx)}
                onClick={() => onSelectIndex(selectedIndex === idx ? null : idx)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
