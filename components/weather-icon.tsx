'use client';

import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Cloudy,
} from 'lucide-react';
import { WeatherCondition } from '@/lib/types';

interface WeatherIconProps {
  condition: WeatherCondition;
  isDay: boolean;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function WeatherIcon({
  condition,
  isDay,
  size = 64,
  className = '',
  animated = true,
}: WeatherIconProps) {
  const iconProps = {
    size,
    className: `${className}`,
    strokeWidth: 1.5,
  };

  const getIcon = () => {
    switch (condition) {
      case 'clear':
        return isDay ? (
          <Sun {...iconProps} className={`${className} text-amber-300`} />
        ) : (
          <Moon {...iconProps} className={`${className} text-slate-200`} />
        );
      case 'clouds':
        return <Cloudy {...iconProps} className={`${className} text-slate-300`} />;
      case 'rain':
        return <CloudRain {...iconProps} className={`${className} text-blue-300`} />;
      case 'drizzle':
        return <CloudDrizzle {...iconProps} className={`${className} text-blue-200`} />;
      case 'thunderstorm':
        return <CloudLightning {...iconProps} className={`${className} text-purple-300`} />;
      case 'snow':
        return <CloudSnow {...iconProps} className={`${className} text-blue-100`} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <CloudFog {...iconProps} className={`${className} text-slate-300`} />;
      default:
        return isDay ? (
          <Cloud {...iconProps} className={`${className} text-slate-300`} />
        ) : (
          <Wind {...iconProps} className={`${className} text-slate-400`} />
        );
    }
  };

  const getAnimation = () => {
    switch (condition) {
      case 'clear':
        return isDay
          ? {
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }
          : {
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            };
      case 'rain':
      case 'drizzle':
        return {
          y: [0, -3, 0],
        };
      case 'thunderstorm':
        return {
          scale: [1, 1.1, 1],
          opacity: [1, 0.7, 1],
        };
      case 'snow':
        return {
          y: [0, 3, 0],
          rotate: [0, 10, -10, 0],
        };
      case 'clouds':
        return {
          x: [0, 3, 0],
        };
      default:
        return {
          scale: [1, 1.02, 1],
        };
    }
  };

  if (!animated) {
    return getIcon();
  }

  return (
    <motion.div
      animate={getAnimation()}
      transition={{
        duration: condition === 'clear' && isDay ? 20 : 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {getIcon()}
    </motion.div>
  );
}
