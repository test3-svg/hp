import type { WeatherIconKind } from '../types/weather';

interface WeatherIconProps {
  kind: WeatherIconKind;
  size?: number;
  className?: string;
}

export function WeatherIcon({ kind, size = 24, className = '' }: WeatherIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    'aria-hidden': true,
  } as const;

  switch (kind) {
    case 'clear-day':
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="6.5" fill="#F59E0B" />
          <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
            <line x1="16" y1="3.5" x2="16" y2="6.2" />
            <line x1="16" y1="25.8" x2="16" y2="28.5" />
            <line x1="3.5" y1="16" x2="6.2" y2="16" />
            <line x1="25.8" y1="16" x2="28.5" y2="16" />
            <line x1="7.16" y1="7.16" x2="9.07" y2="9.07" />
            <line x1="22.93" y1="22.93" x2="24.84" y2="24.84" />
            <line x1="24.84" y1="7.16" x2="22.93" y2="9.07" />
            <line x1="9.07" y1="22.93" x2="7.16" y2="24.84" />
          </g>
        </svg>
      );

    case 'clear-night':
      return (
        <svg {...common}>
          <path
            d="M21.8 19.6A8.4 8.4 0 0 1 12.4 10.2a8.4 8.4 0 0 1 .8-3.6A8.8 8.8 0 1 0 25.4 18.8a8.4 8.4 0 0 1-3.6.8Z"
            fill="#60A5FA"
          />
          <circle cx="23.5" cy="9" r="1.2" fill="#93C5FD" />
        </svg>
      );

    case 'partly-cloudy-day':
      return (
        <svg {...common}>
          <circle cx="11.5" cy="12" r="4.8" fill="#F59E0B" />
          <g stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round">
            <line x1="11.5" y1="4" x2="11.5" y2="5.6" />
            <line x1="3.5" y1="12" x2="5.1" y2="12" />
            <line x1="5.8" y1="6.3" x2="7" y2="7.5" />
            <line x1="17.2" y1="6.3" x2="16" y2="7.5" />
          </g>
          <path
            d="M11.2 24.5h12.2a4.6 4.6 0 0 0 .5-9.17A6.1 6.1 0 0 0 12.1 13.8a5.35 5.35 0 0 0-.9 10.7Z"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'partly-cloudy-night':
      return (
        <svg {...common}>
          <path
            d="M15.4 14.3a5.4 5.4 0 0 1-6-6 5.4 5.4 0 0 1 .5-2.3 5.7 5.7 0 1 0 7.8 7.8 5.4 5.4 0 0 1-2.3.5Z"
            fill="#60A5FA"
          />
          <path
            d="M11.4 24.5h12.2a4.6 4.6 0 0 0 .5-9.17A6.1 6.1 0 0 0 12.3 13.8a5.35 5.35 0 0 0-.9 10.7Z"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'cloudy':
      return (
        <svg {...common}>
          <path
            d="M8.8 23.8h14.4a4.9 4.9 0 0 0 .6-9.76 6.7 6.7 0 0 0-12.8-1.6A5.7 5.7 0 0 0 8.8 23.8Z"
            fill="#94A3B8"
          />
        </svg>
      );

    case 'fog':
      return (
        <svg {...common}>
          <path
            d="M8.8 18.2h14.4a4.2 4.2 0 0 0 .5-8.36 5.8 5.8 0 0 0-11.2-1.38 4.9 4.9 0 0 0-3.7 9.74Z"
            fill="#94A3B8"
          />
          <g stroke="#64748B" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="22" x2="26" y2="22" />
            <line x1="8.5" y1="26" x2="23.5" y2="26" />
          </g>
        </svg>
      );

    case 'drizzle':
    case 'rain':
      return (
        <svg {...common}>
          <path
            d="M8.8 19.8h14.4a4.4 4.4 0 0 0 .5-8.76 6.1 6.1 0 0 0-11.7-1.44 5.1 5.1 0 0 0-3.2 10.2Z"
            fill="#94A3B8"
          />
          <g stroke="#0284C7" strokeWidth="2" strokeLinecap="round">
            <line x1="11.5" y1="22.8" x2="10" y2="26.8" />
            <line x1="16.5" y1="22.8" x2="15" y2="26.8" />
            <line x1="21.5" y1="22.8" x2="20" y2="26.8" />
          </g>
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg {...common}>
          <path
            d="M8.8 19.2h14.4a4.4 4.4 0 0 0 .5-8.76 6.1 6.1 0 0 0-11.7-1.44 5.1 5.1 0 0 0-3.2 10.2Z"
            fill="#64748B"
          />
          <g stroke="#0284C7" strokeWidth="2.1" strokeLinecap="round">
            <line x1="10.2" y1="22" x2="8.2" y2="27.5" />
            <line x1="14.6" y1="22" x2="12.6" y2="27.5" />
            <line x1="19" y1="22" x2="17" y2="27.5" />
            <line x1="23.4" y1="22" x2="21.4" y2="27.5" />
          </g>
        </svg>
      );

    case 'snow':
    case 'sleet':
      return (
        <svg {...common}>
          <path
            d="M8.8 19.2h14.4a4.4 4.4 0 0 0 .5-8.76 6.1 6.1 0 0 0-11.7-1.44 5.1 5.1 0 0 0-3.2 10.2Z"
            fill="#94A3B8"
          />
          <g fill="#38BDF8">
            <circle cx="11" cy="24" r="1.5" />
            <circle cx="16" cy="26.5" r="1.5" />
            <circle cx="21" cy="24" r="1.5" />
          </g>
        </svg>
      );

    case 'thunderstorm':
      return (
        <svg {...common}>
          <path
            d="M8.8 19.2h14.4a4.4 4.4 0 0 0 .5-8.76 6.1 6.1 0 0 0-11.7-1.44 5.1 5.1 0 0 0-3.2 10.2Z"
            fill="#64748B"
          />
          <path
            d="M17.2 20.5 13.8 25h3.1l-1.3 4.2 4.6-5.2h-3.1l1.4-3.5h-1.3Z"
            fill="#F59E0B"
          />
        </svg>
      );
  }
}
