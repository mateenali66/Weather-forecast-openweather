'use client';

import { motion } from 'framer-motion';
import { ForecastData } from '@/lib/types';
import { WeatherIcon } from './weather-icon';
import { getWeatherCondition, formatDay } from '@/lib/weather-utils';

interface ForecastDisplayProps {
  forecast: ForecastData;
}

export function ForecastDisplay({ forecast }: ForecastDisplayProps) {
  // Group forecast by day and get one entry per day (noon time)
  const dailyForecast = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString();
    const hour = new Date(item.dt * 1000).getHours();

    // Prefer noon (12:00) or closest to noon
    if (!acc[date] || Math.abs(hour - 12) < Math.abs(new Date(acc[date].dt * 1000).getHours() - 12)) {
      acc[date] = item;
    }
    return acc;
  }, {} as Record<string, ForecastData['list'][0]>);

  const days = Object.values(dailyForecast).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto mt-6"
    >
      <motion.h2
        variants={itemVariants}
        className="text-white/70 text-sm uppercase tracking-widest mb-4 px-2"
      >
        5-Day Forecast
      </motion.h2>

      <motion.div
        variants={itemVariants}
        className="
          grid grid-cols-5 gap-2 md:gap-4
          bg-white/10 backdrop-blur-xl
          border border-white/20 rounded-2xl
          p-3 md:p-4
        "
      >
        {days.map((day, index) => {
          const condition = getWeatherCondition(day.weather[0].id);
          const isToday = index === 0;

          return (
            <motion.div
              key={day.dt}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`
                flex flex-col items-center p-3 md:p-4 rounded-xl
                transition-all duration-300 cursor-default
                ${isToday ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'}
              `}
            >
              <span className={`text-xs md:text-sm font-medium mb-2 ${isToday ? 'text-white' : 'text-white/60'}`}>
                {isToday ? 'Today' : formatDay(day.dt)}
              </span>

              <WeatherIcon
                condition={condition}
                isDay={true}
                size={32}
                animated={false}
                className="my-2"
              />

              <div className="flex flex-col items-center mt-2">
                <span className="text-white font-semibold text-sm md:text-base">
                  {Math.round(day.main.temp_max)}°
                </span>
                <span className="text-white/50 text-xs md:text-sm">
                  {Math.round(day.main.temp_min)}°
                </span>
              </div>

              <span className="text-white/40 text-[10px] md:text-xs mt-2 text-center capitalize leading-tight">
                {day.weather[0].main}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
