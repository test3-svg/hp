import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CityLocation } from '../types/weather';
import { searchCities } from '../utils/weatherApi';

interface CitySearchProps {
  onSelectCity: (city: CityLocation) => void;
}

export function CitySearch({ onSelectCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearchError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const list = await searchCities(trimmed);
        if (!cancelled) {
          setResults(list);
          setIsOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          setSearchError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleChoose = (city: CityLocation) => {
    onSelectCity(city);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-80">
      <div className="relative flex items-center">
        <Search
          className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim()) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="도시 또는 지역 검색 (예: 서울, 도쿄, 런던)"
          aria-label="도시 검색"
          className="w-full h-10 pl-10 pr-9 text-sm rounded-lg bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            aria-label="검색어 지우기"
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 z-30 bg-white dark:bg-[#121B28] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
              도시 정보를 검색하고 있습니다...
            </div>
          ) : searchError ? (
            <div className="px-4 py-3 text-xs text-rose-600 dark:text-rose-400">
              {searchError}
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
              일치하는 도시를 찾지 못했습니다. 영문명 또는 다른 지역명으로 검색해 보세요.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
              {results.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => handleChoose(city)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {city.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {[city.region, city.country].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
