import { WeatherCondition } from './types';

export function getWeatherCondition(weatherId: number): WeatherCondition {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId === 701) return 'mist';
  if (weatherId === 741) return 'fog';
  if (weatherId >= 700 && weatherId < 800) return 'haze';
  if (weatherId === 800) return 'clear';
  if (weatherId > 800) return 'clouds';
  return 'default';
}

export function getBackgroundGradient(condition: WeatherCondition, isDay: boolean): string {
  const gradients: Record<WeatherCondition, { day: string; night: string }> = {
    clear: {
      day: 'from-amber-300 via-orange-400 to-rose-500',
      night: 'from-indigo-900 via-purple-900 to-slate-900',
    },
    clouds: {
      day: 'from-slate-400 via-gray-500 to-zinc-600',
      night: 'from-slate-700 via-gray-800 to-zinc-900',
    },
    rain: {
      day: 'from-slate-500 via-blue-600 to-indigo-700',
      night: 'from-slate-800 via-blue-900 to-indigo-950',
    },
    drizzle: {
      day: 'from-gray-400 via-slate-500 to-blue-600',
      night: 'from-gray-700 via-slate-800 to-blue-900',
    },
    thunderstorm: {
      day: 'from-gray-600 via-purple-700 to-indigo-800',
      night: 'from-gray-900 via-purple-950 to-indigo-950',
    },
    snow: {
      day: 'from-blue-100 via-slate-200 to-gray-300',
      night: 'from-blue-900 via-slate-800 to-gray-900',
    },
    mist: {
      day: 'from-gray-300 via-slate-400 to-zinc-500',
      night: 'from-gray-700 via-slate-800 to-zinc-900',
    },
    fog: {
      day: 'from-gray-400 via-slate-500 to-zinc-600',
      night: 'from-gray-800 via-slate-900 to-zinc-950',
    },
    haze: {
      day: 'from-amber-200 via-orange-300 to-yellow-400',
      night: 'from-amber-800 via-orange-900 to-yellow-950',
    },
    default: {
      day: 'from-sky-400 via-blue-500 to-indigo-600',
      night: 'from-sky-900 via-blue-950 to-indigo-950',
    },
  };

  const gradient = gradients[condition] || gradients.default;
  return isDay ? gradient.day : gradient.night;
}

export function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDay(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function isDay(sunrise: number, sunset: number, currentTime: number): boolean {
  return currentTime >= sunrise && currentTime <= sunset;
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export function getUVDescription(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}
