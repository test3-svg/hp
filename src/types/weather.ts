export type TemperatureUnit = 'C' | 'F';

export interface CityLocation {
  id: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  dewPoint: number;
  windSpeed: number; // m/s
  windDirection: number; // degrees
  windGusts: number; // m/s
  surfacePressure: number; // hPa
  visibility: number; // meters
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number; // mm
  cloudCover: number; // %
  observationTime: string;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
  humidity: number;
}

export interface DailyForecastPoint {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface AirQualityData {
  pm25: number;
  pm10: number;
  ozone: number;
  nitrogenDioxide: number;
  usAqi: number;
}

export interface WeatherBundle {
  location: CityLocation;
  current: CurrentWeather;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastPoint[];
  airQuality: AirQualityData | null;
  utcOffsetSeconds: number;
}

export type WeatherIconKind =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'sleet'
  | 'thunderstorm';

export interface WeatherConditionMeta {
  label: string;
  summary: string;
  icon: WeatherIconKind;
}
