import type {
  AirQualityData,
  CityLocation,
  TemperatureUnit,
  WeatherBundle,
  WeatherConditionMeta,
} from '../types/weather';

export const DEFAULT_CITIES: CityLocation[] = [
  {
    id: 'seoul',
    name: '서울',
    region: '서울특별시',
    country: '대한민국',
    latitude: 37.5665,
    longitude: 126.978,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'busan',
    name: '부산',
    region: '부산광역시',
    country: '대한민국',
    latitude: 35.1796,
    longitude: 129.0756,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'jeju',
    name: '제주',
    region: '제주특별자치도',
    country: '대한민국',
    latitude: 33.4996,
    longitude: 126.5312,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'incheon',
    name: '인천',
    region: '인천광역시',
    country: '대한민국',
    latitude: 37.4563,
    longitude: 126.7052,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'daegu',
    name: '대구',
    region: '대구광역시',
    country: '대한민국',
    latitude: 35.8714,
    longitude: 128.6014,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'daejeon',
    name: '대전',
    region: '대전광역시',
    country: '대한민국',
    latitude: 36.3504,
    longitude: 127.3845,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'gangneung',
    name: '강릉',
    region: '강원특별자치도',
    country: '대한민국',
    latitude: 37.7519,
    longitude: 128.8761,
    timezone: 'Asia/Seoul',
  },
];

export function formatTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function getWeatherMeta(code: number, isDay: boolean): WeatherConditionMeta {
  switch (code) {
    case 0:
      return {
        label: '맑음',
        summary: isDay ? '구름 한 점 없이 쾌청한 하늘입니다.' : '별빛이 선명한 맑은 밤입니다.',
        icon: isDay ? 'clear-day' : 'clear-night',
      };
    case 1:
      return {
        label: '대체로 맑음',
        summary: '햇살이 비치고 가끔 옅은 구름이 지나갑니다.',
        icon: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
      };
    case 2:
      return {
        label: '구름 조금',
        summary: '하늘에 구름이 간간이 끼어 온화한 날씨입니다.',
        icon: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
      };
    case 3:
      return {
        label: '흐림',
        summary: '하늘 전체에 구름이 두텁게 덮여 있습니다.',
        icon: 'cloudy',
      };
    case 45:
    case 48:
      return {
        label: '안개',
        summary: '가시거리가 짧으니 교통안전에 유의하세요.',
        icon: 'fog',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: '이슬비',
        summary: '가늘고 약한 비가 간헐적으로 내립니다.',
        icon: 'drizzle',
      };
    case 56:
    case 57:
      return {
        label: '어는 이슬비',
        summary: '노면 결빙 위험이 있는 차가운 이슬비가 내립니다.',
        icon: 'sleet',
      };
    case 61:
    case 63:
    case 80:
    case 81:
      return {
        label: '비',
        summary: '우산을 챙기시는 것이 좋습니다.',
        icon: 'rain',
      };
    case 65:
    case 82:
      return {
        label: '강한 비',
        summary: '많은 비가 내리니 침수와 배수에 주의하세요.',
        icon: 'heavy-rain',
      };
    case 66:
    case 67:
      return {
        label: '어는 비',
        summary: '빙판길 위험이 크니 보행 및 운전에 유의하세요.',
        icon: 'sleet',
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        label: '눈',
        summary: '눈이 내리고 기온이 낮아 방한에 신경 써주세요.',
        icon: 'snow',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: '뇌우',
        summary: '천둥과 번개를 동반한 비가 예상됩니다.',
        icon: 'thunderstorm',
      };
    default:
      return {
        label: '구름 많음',
        summary: '변덕스러운 하늘 상태를 보이고 있습니다.',
        icon: 'cloudy',
      };
  }
}

export function getWindDirectionLabel(degrees: number): string {
  const dirs = ['북풍', '북동풍', '동풍', '남동풍', '남풍', '남서풍', '서풍', '북서풍'];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return dirs[index];
}

export function getUvGrade(uv: number): { label: string; tone: 'good' | 'moderate' | 'high' | 'critical'; advice: string } {
  if (uv < 3) {
    return { label: '낮음', tone: 'good', advice: '자외선 차단 부담이 적습니다.' };
  }
  if (uv < 6) {
    return { label: '보통', tone: 'moderate', advice: '장시간 야외 활동 시 선크림을 권장합니다.' };
  }
  if (uv < 8) {
    return { label: '높음', tone: 'high', advice: '모자와 선글라스 착용을 권장합니다.' };
  }
  return { label: '매우 높음', tone: 'critical', advice: '한낮 직사광선 노출을 피하세요.' };
}

export function getPm25Grade(pm25: number): { label: string; tone: 'good' | 'moderate' | 'high' | 'critical' } {
  if (pm25 <= 15) return { label: '좋음', tone: 'good' };
  if (pm25 <= 35) return { label: '보통', tone: 'moderate' };
  if (pm25 <= 75) return { label: '나쁨', tone: 'high' };
  return { label: '매우 나쁨', tone: 'critical' };
}

export function getPm10Grade(pm10: number): { label: string; tone: 'good' | 'moderate' | 'high' | 'critical' } {
  if (pm10 <= 30) return { label: '좋음', tone: 'good' };
  if (pm10 <= 80) return { label: '보통', tone: 'moderate' };
  if (pm10 <= 150) return { label: '나쁨', tone: 'high' };
  return { label: '매우 나쁨', tone: 'critical' };
}

export function getClothingRecommendation(tempC: number, windMs: number, precipProb: number): {
  title: string;
  detail: string;
} {
  const windChill = tempC - windMs * 0.6;
  const rainNote = precipProb >= 40 ? ' 강수 확률이 높아 방수 겉옷과 우산을 함께 준비하세요.' : '';

  if (windChill >= 27) {
    return {
      title: '민소매 · 반팔 · 린넨 소재',
      detail: `통풍이 잘되는 가벼운 여름 옷차림이 적합합니다.${rainNote}`,
    };
  }
  if (windChill >= 22) {
    return {
      title: '반팔 티셔츠 · 얇은 셔츠',
      detail: `활동하기 쾌적하나 실내 냉방에 대비해 얇은 겉옷을 챙겨도 좋습니다.${rainNote}`,
    };
  }
  if (windChill >= 17) {
    return {
      title: '긴팔 티 · 가디건 · 면바지',
      detail: `선선한 공기에 어울리는 가벼운 레이어드 복장이 알맞습니다.${rainNote}`,
    };
  }
  if (windChill >= 11) {
    return {
      title: '자켓 · 트렌치코트 · 니트',
      detail: `일교차와 바람을 막아줄 간절기 아우터를 착용하세요.${rainNote}`,
    };
  }
  if (windChill >= 5) {
    return {
      title: '울 코트 · 경량 패딩 · 히트텍',
      detail: `쌀쌀한 날씨가 이어지므로 보온성 있는 겉옷이 필요합니다.${rainNote}`,
    };
  }
  return {
    title: '두꺼운 패딩 · 목도리 · 장갑',
    detail: `체감 기온이 매우 낮으니 방한용품으로 체온을 유지하세요.${rainNote}`,
  };
}

export async function searchCities(query: string): Promise<CityLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed,
  )}&count=8&language=ko&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('도시 검색 요청에 실패했습니다.');
  }
  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map(
    (item: {
      id: number;
      name: string;
      admin1?: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }) => ({
      id: `${item.id}-${item.latitude.toFixed(2)}-${item.longitude.toFixed(2)}`,
      name: item.name,
      region: item.admin1,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    }),
  );
}

export async function reverseLookupCity(latitude: number, longitude: number): Promise<CityLocation> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address ?? {};
      const city =
        addr.city ||
        addr.town ||
        addr.county ||
        addr.borough ||
        addr.state ||
        '현재 위치';
      const region = addr.borough || addr.suburb || addr.state || undefined;
      return {
        id: `geo-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
        name: city,
        region: region !== city ? region : undefined,
        country: addr.country,
        latitude,
        longitude,
      };
    }
  } catch {
    // Fallback cleanly to coordinate label if reverse geocoding is unavailable
  }

  return {
    id: `geo-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
    name: '현재 위치',
    region: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
    latitude,
    longitude,
  };
}

export async function fetchWeatherBundle(location: CityLocation): Promise<WeatherBundle> {
  const forecastParams = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'visibility',
      'wind_speed_10m',
      'uv_index',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    wind_speed_unit: 'ms',
    timezone: 'auto',
    forecast_days: '7',
  });

  const airParams = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: 'pm10,pm2_5,ozone,nitrogen_dioxide,us_aqi',
    timezone: 'auto',
  });

  const [forecastRes, airRes] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams.toString()}`),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airParams.toString()}`).catch(
      () => null,
    ),
  ]);

  if (!forecastRes.ok) {
    throw new Error('기상 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  const forecastData = await forecastRes.json();
  const airData = airRes && airRes.ok ? await airRes.json() : null;

  const currentTime = forecastData.current.time as string;
  const hourlyTimes = forecastData.hourly.time as string[];

  // Find closest hourly index to current observation time
  let currentHourIdx = hourlyTimes.findIndex((t) => t >= currentTime.slice(0, 13));
  if (currentHourIdx < 0) currentHourIdx = 0;

  const hourlyPoints = hourlyTimes.slice(currentHourIdx, currentHourIdx + 24).map((time, offset) => {
    const idx = currentHourIdx + offset;
    return {
      time,
      temperature: forecastData.hourly.temperature_2m[idx],
      apparentTemperature: forecastData.hourly.apparent_temperature[idx],
      precipitationProbability: forecastData.hourly.precipitation_probability[idx] ?? 0,
      precipitation: forecastData.hourly.precipitation[idx] ?? 0,
      weatherCode: forecastData.hourly.weather_code[idx],
      isDay: forecastData.hourly.is_day[idx] === 1,
      windSpeed: forecastData.hourly.wind_speed_10m[idx],
      humidity: forecastData.hourly.relative_humidity_2m[idx],
    };
  });

  const dailyTimes = forecastData.daily.time as string[];
  const dailyPoints = dailyTimes.map((date, idx) => ({
    date,
    weatherCode: forecastData.daily.weather_code[idx],
    tempMax: forecastData.daily.temperature_2m_max[idx],
    tempMin: forecastData.daily.temperature_2m_min[idx],
    apparentTempMax: forecastData.daily.apparent_temperature_max[idx],
    apparentTempMin: forecastData.daily.apparent_temperature_min[idx],
    sunrise: forecastData.daily.sunrise[idx],
    sunset: forecastData.daily.sunset[idx],
    uvIndexMax: forecastData.daily.uv_index_max[idx] ?? 0,
    precipitationSum: forecastData.daily.precipitation_sum[idx] ?? 0,
    precipitationProbabilityMax: forecastData.daily.precipitation_probability_max[idx] ?? 0,
    windSpeedMax: forecastData.daily.wind_speed_10m_max[idx] ?? 0,
  }));

  const airQuality: AirQualityData | null = airData?.current
    ? {
        pm25: airData.current.pm2_5 ?? 0,
        pm10: airData.current.pm10 ?? 0,
        ozone: airData.current.ozone ?? 0,
        nitrogenDioxide: airData.current.nitrogen_dioxide ?? 0,
        usAqi: airData.current.us_aqi ?? 0,
      }
    : null;

  return {
    location: {
      ...location,
      timezone: forecastData.timezone ?? location.timezone,
    },
    current: {
      temperature: forecastData.current.temperature_2m,
      apparentTemperature: forecastData.current.apparent_temperature,
      humidity: forecastData.current.relative_humidity_2m,
      dewPoint: forecastData.hourly.dew_point_2m[currentHourIdx] ?? 0,
      windSpeed: forecastData.current.wind_speed_10m,
      windDirection: forecastData.current.wind_direction_10m,
      windGusts: forecastData.current.wind_gusts_10m,
      surfacePressure: forecastData.current.surface_pressure,
      visibility: forecastData.hourly.visibility[currentHourIdx] ?? 10000,
      uvIndex: forecastData.hourly.uv_index[currentHourIdx] ?? 0,
      weatherCode: forecastData.current.weather_code,
      isDay: forecastData.current.is_day === 1,
      precipitation: forecastData.current.precipitation,
      cloudCover: forecastData.current.cloud_cover,
      observationTime: forecastData.current.time,
    },
    hourly: hourlyPoints,
    daily: dailyPoints,
    airQuality,
    utcOffsetSeconds: forecastData.utc_offset_seconds ?? 32400,
  };
}
