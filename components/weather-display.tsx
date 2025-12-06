'use client';

import { motion } from 'framer-motion';
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { WeatherData } from '@/lib/types';
import { WeatherIcon } from './weather-icon';
import {
  getWeatherCondition,
  formatTime,
  isDay as checkIsDay,
  getWindDirection,
} from '@/lib/weather-utils';

interface WeatherDisplayProps {
  weather: WeatherData;
}

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const condition = getWeatherCondition(weather.weather[0].id);
  const isDayTime = checkIsDay(weather.sys.sunrise, weather.sys.sunset, weather.dt);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const stats = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${weather.main.humidity}%`,
      color: 'text-blue-300',
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${Math.round(weather.wind.speed * 3.6)} km/h ${getWindDirection(weather.wind.deg)}`,
      color: 'text-teal-300',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${(weather.visibility / 1000).toFixed(1)} km`,
      color: 'text-purple-300',
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${weather.main.pressure} hPa`,
      color: 'text-amber-300',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto"
    >
      {/* Main Weather Card */}
      <motion.div
        variants={itemVariants}
        className="
          relative overflow-hidden rounded-3xl
          bg-white/10 backdrop-blur-2xl
          border border-white/20
          p-8 md:p-12
        "
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          {/* Location */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
              {weather.name}
              <span className="text-white/50 ml-2">{weather.sys.country}</span>
            </h1>
            <p className="text-white/60 mt-2 text-lg capitalize">
              {weather.weather[0].description}
            </p>
          </motion.div>

          {/* Temperature & Icon */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10"
          >
            <WeatherIcon
              condition={condition}
              isDay={isDayTime}
              size={120}
              className="drop-shadow-2xl"
            />

            <div className="text-center md:text-left">
              <div className="flex items-start justify-center md:justify-start">
                <span className="text-8xl md:text-9xl font-extralight text-white tracking-tighter">
                  {Math.round(weather.main.temp)}
                </span>
                <span className="text-4xl text-white/70 mt-4">°C</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-1 text-white/60">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-sm">Feels like {Math.round(weather.main.feels_like)}°</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-1 text-red-300/80">
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-sm">{Math.round(weather.main.temp_max)}°</span>
                </div>
                <div className="flex items-center gap-1 text-blue-300/80">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-sm">{Math.round(weather.main.temp_min)}°</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="
                  bg-white/5 backdrop-blur-sm rounded-2xl p-4
                  border border-white/10 hover:border-white/20
                  transition-colors duration-300
                "
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-white/50 text-xs uppercase tracking-wider">{stat.label}</p>
                <p className="text-white font-medium mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Sunrise/Sunset */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-8 mt-8 pt-6 border-t border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Sunrise className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Sunrise</p>
                <p className="text-white font-medium">
                  {formatTime(weather.sys.sunrise, weather.timezone)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20">
                <Sunset className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Sunset</p>
                <p className="text-white font-medium">
                  {formatTime(weather.sys.sunset, weather.timezone)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
