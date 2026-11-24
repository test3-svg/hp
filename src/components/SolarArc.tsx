interface SolarArcProps {
  sunriseIso: string;
  sunsetIso: string;
  currentIso: string;
}

export function SolarArc({ sunriseIso, sunsetIso, currentIso }: SolarArcProps) {
  const sunriseTime = sunriseIso.slice(11, 16);
  const sunsetTime = sunsetIso.slice(11, 16);

  const toMinutes = (iso: string) => {
    const [h, m] = iso.slice(11, 16).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const riseMin = toMinutes(sunriseIso);
  const setMin = toMinutes(sunsetIso);
  const currMin = toMinutes(currentIso);

  const totalDaylight = Math.max(setMin - riseMin, 1);
  const progress = Math.min(Math.max((currMin - riseMin) / totalDaylight, 0), 1);
  const isDaytime = currMin >= riseMin && currMin <= setMin;

  // Semi-circle arc from (16, 62) to (164, 62), center (90, 62), radius 74 (rx=74, ry=46)
  const cx = 90;
  const cy = 62;
  const rx = 74;
  const ry = 46;
  const angle = Math.PI * (1 - progress);
  const sunX = cx + rx * Math.cos(angle);
  const sunY = cy - ry * Math.sin(angle);

  return (
    <div className="flex flex-col justify-between h-full">
      <svg viewBox="0 0 180 76" className="w-full max-w-[200px] h-auto overflow-visible" aria-hidden="true">
        {/* Horizon baseline */}
        <line
          x1="10"
          y1={cy}
          x2="170"
          y2={cy}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="1"
        />
        {/* Full solar path */}
        <path
          d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          strokeDasharray="3 3"
          strokeWidth="1.5"
        />
        {/* Elapsed daylight path */}
        {isDaytime && (
          <path
            d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${sunX.toFixed(1)} ${sunY.toFixed(1)}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
          />
        )}
        {/* Sunrise & Sunset anchors */}
        <circle cx={cx - rx} cy={cy} r="2.5" className="fill-slate-400 dark:fill-slate-500" />
        <circle cx={cx + rx} cy={cy} r="2.5" className="fill-slate-400 dark:fill-slate-500" />

        {/* Sun indicator */}
        {isDaytime && (
          <g>
            <circle cx={sunX} cy={sunY} r="7" className="fill-amber-400/25" />
            <circle cx={sunX} cy={sunY} r="4" className="fill-amber-500" />
          </g>
        )}
      </svg>

      <div className="flex items-center justify-between text-xs font-mono tabular-nums pt-1">
        <div>
          <span className="font-sans text-slate-400 dark:text-slate-500 mr-1.5">일출</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{sunriseTime}</span>
        </div>
        <div>
          <span className="font-sans text-slate-400 dark:text-slate-500 mr-1.5">일몰</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{sunsetTime}</span>
        </div>
      </div>
    </div>
  );
}
