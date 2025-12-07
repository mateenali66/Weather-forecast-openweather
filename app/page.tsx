'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, AlertCircle, Github, Plane, Cloud } from 'lucide-react';
import { SearchLocation } from '@/components/search-location';
import { WeatherDisplay } from '@/components/weather-display';
import { ForecastDisplay } from '@/components/forecast-display';
import { AnimatedBackground } from '@/components/animated-background';
import { AirportSearch } from '@/components/airport-search';
import { AviationDisplay } from '@/components/aviation-display';
import { WeatherData, ForecastData, WeatherCondition } from '@/lib/types';
import { AviationData } from '@/lib/aviation-types';
import {
  getWeatherCondition,
  getBackgroundGradient,
  isDay as checkIsDay,
} from '@/lib/weather-utils';
import { getAviationGradient } from '@/lib/aviation-utils';

type AppMode = 'weather' | 'aviation';

export default function Home() {
  // Mode state - aviation is default
  const [mode, setMode] = useState<AppMode>('aviation');

  // Weather mode state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [condition, setCondition] = useState<WeatherCondition>('default');
  const [isDay, setIsDay] = useState(true);

  // Aviation mode state
  const [aviationData, setAviationData] = useState<AviationData | null>(null);
  const [aviationLoading, setAviationLoading] = useState(false);
  const [aviationError, setAviationError] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<string>('');

  // Load saved mode preference
  useEffect(() => {
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('appMode') as AppMode : null;
    if (savedMode === 'weather' || savedMode === 'aviation') {
      setMode(savedMode);
    }
  }, []);

  // Save mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appMode', mode);
    }
  }, [mode]);

  const fetchWeather = useCallback(async (params: { city?: string; lat?: number; lon?: number }) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = params.city
        ? `city=${encodeURIComponent(params.city)}`
        : `lat=${params.lat}&lon=${params.lon}`;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?${queryString}`),
        fetch(`/api/weather?${queryString}&type=forecast`),
      ]);

      if (!weatherRes.ok) {
        const errorData = await weatherRes.json();
        throw new Error(errorData.error || 'Failed to fetch weather');
      }

      const weatherData: WeatherData = await weatherRes.json();
      const forecastData: ForecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData);

      // Update background based on weather
      const weatherCondition = getWeatherCondition(weatherData.weather[0].id);
      const isDayTime = checkIsDay(
        weatherData.sys.sunrise,
        weatherData.sys.sunset,
        weatherData.dt
      );
      setCondition(weatherCondition);
      setIsDay(isDayTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setWeather(null);
      setForecast(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAviationWeather = useCallback(async (location: string, runway?: number) => {
    setAviationLoading(true);
    setAviationError(null);

    try {
      let url = `/api/aviation?location=${encodeURIComponent(location)}`;
      if (runway) {
        url += `&runway=${runway}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch aviation weather');
      }

      setAviationData(data);
      setSelectedAirport(location);

      // Save last airport
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAirport', location);
      }
    } catch (err) {
      setAviationError(err instanceof Error ? err.message : 'Failed to fetch aviation weather');
      setAviationData(null);
    } finally {
      setAviationLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (city: string) => {
      fetchWeather({ city });
    },
    [fetchWeather]
  );

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchWeather]);

  const handleAirportSearch = useCallback(
    (location: string, runway?: number) => {
      fetchAviationWeather(location, runway);
    },
    [fetchAviationWeather]
  );

  const handleAviationRefresh = useCallback(() => {
    if (selectedAirport) {
      fetchAviationWeather(selectedAirport);
    }
  }, [selectedAirport, fetchAviationWeather]);

  // Load saved city on weather mode
  useEffect(() => {
    if (mode === 'weather') {
      const savedCity = typeof window !== 'undefined' ? localStorage.getItem('weatherCity') : null;
      if (savedCity && !weather) {
        fetchWeather({ city: savedCity });
      }
    }
  }, [mode, fetchWeather, weather]);

  // Load saved airport on aviation mode
  useEffect(() => {
    if (mode === 'aviation') {
      const savedAirport = typeof window !== 'undefined' ? localStorage.getItem('lastAirport') : null;
      if (savedAirport && !aviationData) {
        fetchAviationWeather(savedAirport);
      }
    }
  }, [mode, fetchAviationWeather, aviationData]);

  // Save city to localStorage when weather changes
  useEffect(() => {
    if (weather?.name && typeof window !== 'undefined') {
      localStorage.setItem('weatherCity', weather.name);
    }
  }, [weather?.name]);

  // Calculate background gradient based on mode
  const backgroundGradient =
    mode === 'aviation' && aviationData?.assessment
      ? getAviationGradient(aviationData.assessment.overall)
      : getBackgroundGradient(condition, isDay);

  const currentError = mode === 'weather' ? error : aviationError;
  const currentLoading = mode === 'weather' ? isLoading : aviationLoading;

  return (
    <main
      className={`
        min-h-screen relative overflow-hidden
        bg-gradient-to-br ${backgroundGradient}
        transition-all duration-1000 ease-in-out
      `}
    >
      {/* Animated particles based on weather (only in weather mode) */}
      {mode === 'weather' && <AnimatedBackground condition={condition} isDay={isDay} />}

      {/* Noise overlay for texture */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-4 px-4"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {mode === 'weather' ? (
                  <CloudSun className="w-8 h-8 text-white/80" />
                ) : (
                  <Plane className="w-8 h-8 text-white/80" />
                )}
              </motion.div>
              <h1 className="text-xl font-light text-white/90 tracking-wide">
                {mode === 'weather' ? (
                  <>Weather<span className="font-semibold">App</span></>
                ) : (
                  <>Aviation<span className="font-semibold">Wx</span></>
                )}
              </h1>
            </div>

            <a
              href="https://github.com/mateenali66/Weather-forecast-openweather"
              target="_blank"
              rel="noopener noreferrer"
              className="
                p-2 rounded-xl bg-white/10 hover:bg-white/20
                text-white/70 hover:text-white transition-all
              "
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </motion.header>

        {/* Mode Toggle */}
        <div className="px-4 mb-4">
          <div className="max-w-md mx-auto">
            <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-lg border border-white/10">
              <button
                onClick={() => setMode('weather')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                  text-sm font-medium transition-all
                  ${mode === 'weather'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80'}
                `}
              >
                <Cloud className="w-4 h-4" />
                Weather
              </button>
              <button
                onClick={() => setMode('aviation')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                  text-sm font-medium transition-all
                  ${mode === 'aviation'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80'}
                `}
              >
                <Plane className="w-4 h-4" />
                Aviation
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          {mode === 'weather' ? (
            <SearchLocation
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              isLoading={isLoading}
              locationLoading={locationLoading}
            />
          ) : (
            <AirportSearch
              onSearch={handleAirportSearch}
              isLoading={aviationLoading}
            />
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {currentError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 mb-4"
            >
              <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{currentError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="flex-1 px-4 pb-8">
          <AnimatePresence mode="wait">
            {currentLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white/80"
                />
                <p className="mt-6 text-white/60 text-lg font-light">
                  {mode === 'weather' ? 'Fetching weather data...' : 'Fetching aviation weather...'}
                </p>
              </motion.div>
            ) : mode === 'weather' ? (
              weather && forecast ? (
                <motion.div
                  key="weather"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <WeatherDisplay weather={weather} />
                  <ForecastDisplay forecast={forecast} />
                </motion.div>
              ) : (
                <motion.div
                  key="weather-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <CloudSun className="w-24 h-24 text-white/30" />
                  </motion.div>
                  <h2 className="mt-6 text-2xl font-light text-white/70">
                    Discover the weather
                  </h2>
                  <p className="mt-2 text-white/40 text-center max-w-md">
                    Search for a city or use your current location to see the
                    current weather and 5-day forecast
                  </p>
                </motion.div>
              )
            ) : aviationData ? (
              <motion.div
                key="aviation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <AviationDisplay
                  data={aviationData}
                  airport={selectedAirport}
                  onRefresh={handleAviationRefresh}
                  isRefreshing={aviationLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="aviation-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Plane className="w-24 h-24 text-white/30" />
                </motion.div>
                <h2 className="mt-6 text-2xl font-light text-white/70">
                  Aviation Weather
                </h2>
                <p className="mt-2 text-white/40 text-center max-w-md">
                  Enter an airport code (CYYZ), city, or airport name to get
                  METAR, TAF, and VFR flying conditions for Cessna 172
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="py-4 text-center"
        >
          <p className="text-white/30 text-sm font-light">
            Powered by{' '}
            {mode === 'weather' ? (
              <a
                href="https://openweathermap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/50 transition-colors underline underline-offset-2"
              >
                OpenWeatherMap
              </a>
            ) : (
              <a
                href="https://aviationweather.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/50 transition-colors underline underline-offset-2"
              >
                aviationweather.gov
              </a>
            )}
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
