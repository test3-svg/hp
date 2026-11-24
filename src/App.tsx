import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  Compass,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  TriangleAlert,
  Umbrella,
  Wind,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CitySearch } from './components/CitySearch';
import { HourlyChart } from './components/HourlyChart';
import { SolarArc } from './components/SolarArc';
import { WeatherIcon } from './components/WeatherIcon';
import type { CityLocation, TemperatureUnit, WeatherBundle } from './types/weather';
import {
  DEFAULT_CITIES,
  fetchWeatherBundle,
  formatTemp,
  getClothingRecommendation,
  getPm10Grade,
  getPm25Grade,
  getUvGrade,
  getWeatherMeta,
  getWindDirectionLabel,
  reverseLookupCity,
} from './utils/weatherApi';

const SAVED_CITIES_KEY = 'haneulgyeol_saved_cities_v1';
const THEME_KEY = 'haneulgyeol_theme_v1';
const UNIT_KEY = 'haneulgyeol_unit_v1';

function formatKoreanDayLabel(dateStr: string, index: number): { dayName: string; dateShort: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, (m || 1) - 1, d || 1);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dateShort = `${m}.${d}`;
  if (index === 0) return { dayName: '오늘', dateShort };
  if (index === 1) return { dayName: '내일', dateShort };
  return { dayName: `${weekdays[dateObj.getDay()]}요일`, dateShort };
}

function formatObservationStamp(iso: string): string {
  const [datePart, timePart] = iso.split('T');
  if (!datePart || !timePart) return iso;
  const [, month, day] = datePart.split('-');
  return `${Number(month)}월 ${Number(day)}일 ${timePart.slice(0, 5)} 관측`;
}

function getToneClasses(tone: 'good' | 'moderate' | 'high' | 'critical') {
  switch (tone) {
    case 'good':
      return {
        text: 'text-emerald-700 dark:text-emerald-400',
        bar: 'bg-emerald-500',
        Icon: CheckCircle2,
      };
    case 'moderate':
      return {
        text: 'text-amber-700 dark:text-amber-400',
        bar: 'bg-amber-500',
        Icon: TriangleAlert,
      };
    case 'high':
      return {
        text: 'text-orange-700 dark:text-orange-400',
        bar: 'bg-orange-500',
        Icon: TriangleAlert,
      };
    case 'critical':
      return {
        text: 'text-rose-700 dark:text-rose-400',
        bar: 'bg-rose-500',
        Icon: AlertCircle,
      };
  }
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage access issues
    }
    return 'light';
  });

  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem(UNIT_KEY);
      if (saved === 'C' || saved === 'F') return saved;
    } catch {
      // ignore
    }
    return 'C';
  });

  const [savedCities, setSavedCities] = useState<CityLocation[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_CITIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CITIES.slice(0, 5);
  });

  const [selectedCity, setSelectedCity] = useState<CityLocation>(DEFAULT_CITIES[0]);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(UNIT_KEY, unit);
    } catch {
      // ignore
    }
  }, [unit]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(savedCities));
    } catch {
      // ignore
    }
  }, [savedCities]);

  const loadWeather = useCallback(async (city: CityLocation) => {
    setLoading(true);
    setError(null);
    setSelectedHourIdx(null);
    setSelectedDayIdx(0);
    try {
      const bundle = await fetchWeatherBundle(city);
      setWeather(bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : '날씨 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity, loadWeather]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('이 브라우저에서는 위치 조회를 지원하지 않습니다.');
      return;
    }

    setGeoLoading(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseLookupCity(pos.coords.latitude, pos.coords.longitude);
          setSelectedCity(loc);
          setGeoMessage(null);
        } catch {
          setGeoMessage('현재 위치의 지역명을 확인하지 못했습니다.');
        } finally {
          setGeoLoading(false);
        }
      },
      (geoErr) => {
        setGeoLoading(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setGeoMessage('위치 접근 권한이 거부되었습니다. 도시 검색을 이용해 주세요.');
        } else {
          setGeoMessage('현재 위치를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  const isSaved = useMemo(
    () =>
      savedCities.some(
        (c) =>
          Math.abs(c.latitude - selectedCity.latitude) < 0.05 &&
          Math.abs(c.longitude - selectedCity.longitude) < 0.05,
      ),
    [savedCities, selectedCity],
  );

  const toggleSaveCity = () => {
    if (isSaved) {
      if (savedCities.length <= 1) return; // keep at least one quick slot
      setSavedCities((prev) =>
        prev.filter(
          (c) =>
            !(
              Math.abs(c.latitude - selectedCity.latitude) < 0.05 &&
              Math.abs(c.longitude - selectedCity.longitude) < 0.05
            ),
        ),
      );
    } else {
      setSavedCities((prev) => [selectedCity, ...prev].slice(0, 8));
    }
  };

  const weeklyRange = useMemo(() => {
    if (!weather || weather.daily.length === 0) return { min: 0, max: 30 };
    const mins = weather.daily.map((d) => formatTemp(d.tempMin, unit));
    const maxs = weather.daily.map((d) => formatTemp(d.tempMax, unit));
    return {
      min: Math.min(...mins),
      max: Math.max(...maxs),
    };
  }, [weather, unit]);

  const currentMeta = weather
    ? getWeatherMeta(weather.current.weatherCode, weather.current.isDay)
    : null;

  const todayDaily = weather?.daily[0];
  const selectedDay = weather?.daily[selectedDayIdx] ?? todayDaily;
  const uvGrade = weather ? getUvGrade(weather.current.uvIndex) : null;
  const pm25Grade = weather?.airQuality ? getPm25Grade(weather.airQuality.pm25) : null;
  const pm10Grade = weather?.airQuality ? getPm10Grade(weather.airQuality.pm10) : null;
  const clothing = weather
    ? getClothingRecommendation(
        weather.current.temperature,
        weather.current.windSpeed,
        todayDaily?.precipitationProbabilityMax ?? 0,
      )
    : null;

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-slate-900 dark:bg-[#0B111A] dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-20 bg-[#F7F9FB]/95 dark:bg-[#0B111A]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <a
            href="#today-weather"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            하늘결
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="주요 섹션 이동"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#today-weather"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              오늘 날씨
            </a>
            <a
              href="#hourly-forecast"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              시간별 예보
            </a>
            <a
              href="#weekly-forecast"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              주간 예보
            </a>
            <a
              href="#air-metrics"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              대기질
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{geoLoading ? '위치 확인 중' : '내 위치'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Workspace Control Bar: Search, Saved City Tabs, Unit & Theme Controls */}
        <section aria-label="지역 선택 및 표시 설정" className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
              <CitySearch onSelectCity={(city) => setSelectedCity(city)} />

              <div className="flex items-center gap-1.5 overflow-x-auto weather-scroll py-0.5">
                {savedCities.map((city) => {
                  const active =
                    Math.abs(city.latitude - selectedCity.latitude) < 0.05 &&
                    Math.abs(city.longitude - selectedCity.longitude) < 0.05;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300 dark:bg-[#121B28] dark:text-slate-300 dark:border-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {city.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleSaveCity}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  isSaved
                    ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 dark:bg-[#121B28] dark:text-slate-300 dark:border-slate-800'
                }`}
                aria-label={isSaved ? '즐겨찾는 지역에서 제거' : '즐겨찾는 지역에 저장'}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
                <span>{isSaved ? '저장됨' : '지역 저장'}</span>
              </button>

              {/* Segmented unit switcher */}
              <div
                role="group"
                aria-label="온도 단위 선택"
                className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => setUnit('C')}
                  className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    unit === 'C'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-[#121B28] dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('F')}
                  className={`px-2.5 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    unit === 'F'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-[#121B28] dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  °F
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Sun className="w-4 h-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => loadWeather(selectedCity)}
                disabled={loading}
                aria-label="날씨 새로고침"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors shrink-0"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {geoMessage && (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{geoMessage}</span>
            </div>
          )}
        </section>

        {/* Error State */}
        {error && !loading && (
          <section
            role="alert"
            className="bg-white dark:bg-[#121B28] border border-rose-200 dark:border-rose-900/50 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  기상 데이터를 불러올 수 없습니다
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadWeather(selectedCity)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              다시 시도
            </button>
          </section>
        )}

        {/* Loading Skeleton matching main layout geometry */}
        {loading && !weather && (
          <div className="space-y-6" aria-busy="true" aria-label="날씨 정보 불러오는 중">
            <div className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-[290px] animate-pulse" />
            <div className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-[156px] animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-[420px] animate-pulse" />
              <div className="lg:col-span-7 bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-[420px] animate-pulse" />
            </div>
          </div>
        )}

        {/* Main Weather Viewport */}
        {weather && currentMeta && (
          <>
            {/* 1. Primary Current Weather Hero + 24h Curve */}
            <section
              id="today-weather"
              className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left: Dominant Focal Anchor */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{[weather.location.region, weather.location.country].filter(Boolean).join(' · ') || '기상 관측'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {weather.location.latitude.toFixed(2)}°N, {weather.location.longitude.toFixed(2)}°E
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatObservationStamp(weather.current.observationTime)}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                      {weather.location.name}
                    </h1>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <WeatherIcon kind={currentMeta.icon} size={64} className="shrink-0" />
                      <div className="font-mono tabular-nums text-6xl sm:text-[68px] font-semibold leading-none tracking-tight text-slate-900 dark:text-white">
                        {formatTemp(weather.current.temperature, unit)}
                        <span className="text-2xl sm:text-3xl font-normal text-slate-400 dark:text-slate-500 align-top ml-1">
                          °{unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {currentMeta.label}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                        체감 {formatTemp(weather.current.apparentTemperature, unit)}°
                      </span>
                      {todayDaily && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                            최고 {formatTemp(todayDaily.tempMax, unit)}° / 최저{' '}
                            {formatTemp(todayDaily.tempMin, unit)}°
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currentMeta.summary}
                    </p>
                  </div>
                </div>

                {/* Right: Interactive 24h Curve */}
                <div className="lg:col-span-7 lg:pl-8 lg:border-l border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[230px]">
                  <HourlyChart
                    hourly={weather.hourly}
                    unit={unit}
                    selectedIndex={selectedHourIdx}
                    onSelectIndex={setSelectedHourIdx}
                  />
                </div>
              </div>
            </section>

            {/* 2. Hourly Forecast Strip */}
            <section
              id="hourly-forecast"
              className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  시간별 예보
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  향후 24시간 · 항목 선택 시 상단 그래프 강조
                </span>
              </div>

              <div className="flex items-stretch gap-2 overflow-x-auto weather-scroll pb-1">
                {weather.hourly.slice(0, 24).map((hour, idx) => {
                  const meta = getWeatherMeta(hour.weatherCode, hour.isDay);
                  const isSelected = selectedHourIdx === idx;
                  const timeLabel = idx === 0 ? '지금' : `${hour.time.slice(11, 13)}시`;

                  return (
                    <button
                      key={hour.time}
                      type="button"
                      onClick={() => setSelectedHourIdx(isSelected ? null : idx)}
                      className={`flex flex-col items-center justify-between gap-2.5 min-w-[70px] px-3 py-3 rounded-lg border transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-sky-50 border-sky-300 dark:bg-sky-500/15 dark:border-sky-500/40'
                          : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          idx === 0
                            ? 'font-semibold text-sky-700 dark:text-sky-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {timeLabel}
                      </span>
                      <WeatherIcon kind={meta.icon} size={26} />
                      <span className="text-sm font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatTemp(hour.temperature, unit)}°
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-sky-600 dark:text-sky-400 h-4">
                        {hour.precipitationProbability >= 10 ? `${hour.precipitationProbability}%` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Weekly Forecast (5 cols) + Atmospheric & Air Quality Details (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Weekly 7-Day Forecast */}
              <section
                id="weekly-forecast"
                className="lg:col-span-5 bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    주간 예보
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    7일 전망 · 날짜 선택 시 상세 확인
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {weather.daily.map((day, idx) => {
                    const { dayName, dateShort } = formatKoreanDayLabel(day.date, idx);
                    const meta = getWeatherMeta(day.weatherCode, true);
                    const minT = formatTemp(day.tempMin, unit);
                    const maxT = formatTemp(day.tempMax, unit);
                    const totalSpan = Math.max(weeklyRange.max - weeklyRange.min, 1);
                    const leftPct = ((minT - weeklyRange.min) / totalSpan) * 100;
                    const widthPct = Math.max(((maxT - minT) / totalSpan) * 100, 8);
                    const active = selectedDayIdx === idx;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`w-full py-3 px-2 -mx-2 rounded-lg grid grid-cols-[64px_34px_46px_1fr_76px] items-center gap-2 text-left transition-colors ${
                          active
                            ? 'bg-slate-50 dark:bg-slate-800/60'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {dayName}
                          </div>
                          <div className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                            {dateShort}
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <WeatherIcon kind={meta.icon} size={24} />
                        </div>

                        <div className="text-xs font-mono tabular-nums text-sky-600 dark:text-sky-400 text-right pr-1">
                          {day.precipitationProbabilityMax >= 10
                            ? `${day.precipitationProbabilityMax}%`
                            : ''}
                        </div>

                        {/* Calibrated min/max temperature range bar */}
                        <div className="relative h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-500 to-amber-500"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-1.5 text-sm font-mono tabular-nums">
                          <span className="text-slate-400 dark:text-slate-500">{minT}°</span>
                          <span className="text-slate-300 dark:text-slate-700">/</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {maxT}°
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Expanded Summary */}
                {selectedDay && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">강수량 합계</div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {selectedDay.precipitationSum.toFixed(1)} mm
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">최대 풍속</div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {selectedDay.windSpeedMax.toFixed(1)} m/s
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">최대 자외선</div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {selectedDay.uvIndexMax.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 dark:text-slate-500">일출 · 일몰</div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {selectedDay.sunrise.slice(11, 16)} · {selectedDay.sunset.slice(11, 16)}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Atmospheric Metrics & Air Quality */}
              <div id="air-metrics" className="lg:col-span-7 space-y-6">
                {/* Air Quality Section */}
                <section className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      대기질 현황
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      환경부 미세먼지 기준
                    </span>
                  </div>

                  {weather.airQuality && pm25Grade && pm10Grade ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                      {/* PM2.5 */}
                      {(() => {
                        const tone = getToneClasses(pm25Grade.tone);
                        const StatusIcon = tone.Icon;
                        const pct = Math.min((weather.airQuality.pm25 / 100) * 100, 100);
                        return (
                          <div className="pt-2 sm:pt-0">
                            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>초미세먼지 (PM2.5)</span>
                              <span className={`inline-flex items-center gap-1 font-semibold ${tone.text}`}>
                                <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                {pm25Grade.label}
                              </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                              <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                                {Math.round(weather.airQuality.pm25)}
                              </span>
                              <span className="text-xs font-mono text-slate-400">㎍/㎥</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${tone.bar}`}
                                style={{ width: `${Math.max(pct, 6)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* PM10 */}
                      {(() => {
                        const tone = getToneClasses(pm10Grade.tone);
                        const StatusIcon = tone.Icon;
                        const pct = Math.min((weather.airQuality.pm10 / 180) * 100, 100);
                        return (
                          <div className="pt-4 sm:pt-0 sm:pl-6">
                            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>미세먼지 (PM10)</span>
                              <span className={`inline-flex items-center gap-1 font-semibold ${tone.text}`}>
                                <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                                {pm10Grade.label}
                              </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                              <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                                {Math.round(weather.airQuality.pm10)}
                              </span>
                              <span className="text-xs font-mono text-slate-400">㎍/㎥</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${tone.bar}`}
                                style={{ width: `${Math.max(pct, 6)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Ozone & US AQI */}
                      <div className="pt-4 sm:pt-0 sm:pl-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>오존 (O₃)</span>
                          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                            {Math.round(weather.airQuality.ozone)} ㎍/㎥
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            통합 대기지수 (AQI)
                          </span>
                          <span className="text-xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                            {Math.round(weather.airQuality.usAqi)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {pm25Grade.tone === 'good'
                            ? '실내 환기 및 야외 활동에 쾌적합니다.'
                            : pm25Grade.tone === 'moderate'
                              ? '민감군은 장시간 실외 활동을 자제하세요.'
                              : '외출 시 보건용 마스크 착용을 권장합니다.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      현재 지역의 실시간 대기질 측정 정보를 제공받지 못했습니다.
                    </div>
                  )}
                </section>

                {/* 6-Metric Atmospheric Grid (flat hairline grid, no nested cards) */}
                <section className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-x divide-slate-100 dark:divide-slate-800">
                    {/* Wind */}
                    <div className="p-5 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>바람</span>
                        <Wind className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                            {weather.current.windSpeed.toFixed(1)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">m/s</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Compass
                            className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0"
                            style={{ transform: `rotate(${weather.current.windDirection}deg)` }}
                            aria-hidden="true"
                          />
                          <span>{getWindDirectionLabel(weather.current.windDirection)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            돌풍 {weather.current.windGusts.toFixed(1)} m/s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="p-5 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>습도</span>
                        <Droplets className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                            {Math.round(weather.current.humidity)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">%</span>
                        </div>
                        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          이슬점 {formatTemp(weather.current.dewPoint, unit)}°{unit}
                        </div>
                      </div>
                    </div>

                    {/* UV Index */}
                    <div className="p-5 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>자외선 지수</span>
                        <Sun className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      </div>
                      {uvGrade && (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                              {weather.current.uvIndex.toFixed(1)}
                            </span>
                            <span className={`text-xs font-semibold ${getToneClasses(uvGrade.tone).text}`}>
                              {uvGrade.label}
                            </span>
                          </div>
                          <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                            {uvGrade.advice}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Surface Pressure */}
                    <div className="p-5 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>기압</span>
                        <Gauge className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                            {Math.round(weather.current.surfacePressure)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">hPa</span>
                        </div>
                        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {weather.current.surfacePressure >= 1018
                            ? '고기압권 · 안정적인 기류'
                            : weather.current.surfacePressure <= 1008
                              ? '저기압권 · 날씨 변화 유의'
                              : '표준 기압 범위'}
                        </div>
                      </div>
                    </div>

                    {/* Visibility */}
                    <div className="p-5 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>가시거리</span>
                        <Eye className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                            {(weather.current.visibility / 1000).toFixed(1)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">km</span>
                        </div>
                        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          운량 {Math.round(weather.current.cloudCover)}% · 강수 {weather.current.precipitation.toFixed(1)} mm
                        </div>
                      </div>
                    </div>

                    {/* Sunrise / Sunset Solar Arc */}
                    <div className="p-5 flex flex-col justify-between gap-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400">일출 · 일몰</div>
                      {todayDaily && (
                        <SolarArc
                          sunriseIso={todayDaily.sunrise}
                          sunsetIso={todayDaily.sunset}
                          currentIso={weather.current.observationTime}
                        />
                      )}
                    </div>
                  </div>
                </section>

                {/* Lifestyle & Clothing Guidance */}
                {clothing && (
                  <section className="bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Umbrella className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        오늘의 옷차림 · 생활 가이드
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                        {clothing.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {clothing.detail}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 border-t border-slate-200 dark:border-slate-800/80 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>하늘결 · 실시간 기상 및 대기질 예보</span>
          <span>기상 데이터 제공: Open-Meteo</span>
        </div>
      </footer>
    </div>
  );
}
