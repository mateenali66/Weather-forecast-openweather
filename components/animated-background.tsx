'use client';

import { motion } from 'framer-motion';
import { WeatherCondition } from '@/lib/types';

interface AnimatedBackgroundProps {
  condition: WeatherCondition;
  isDay: boolean;
}

export function AnimatedBackground({ condition, isDay }: AnimatedBackgroundProps) {
  const renderParticles = () => {
    switch (condition) {
      case 'rain':
      case 'drizzle':
        return (
          <>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-4 bg-blue-300/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: -20,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  opacity: [0.3, 0.7, 0],
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
              />
            ))}
          </>
        );

      case 'snow':
        return (
          <>
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: -20,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, Math.random() * 50 - 25],
                  rotate: [0, 360],
                  opacity: [0.4, 0.8, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: 'linear',
                }}
              />
            ))}
          </>
        );

      case 'thunderstorm':
        return (
          <motion.div
            className="absolute inset-0 bg-white/5"
            animate={{
              opacity: [0, 0.3, 0, 0.2, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3 + Math.random() * 5,
            }}
          />
        );

      case 'clear':
        if (isDay) {
          return (
            <motion.div
              className="absolute top-10 right-10 w-32 h-32 rounded-full bg-yellow-300/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        } else {
          return (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/50 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </>
          );
        }

      case 'clouds':
        return (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/5 rounded-full blur-2xl"
                style={{
                  width: 100 + Math.random() * 200,
                  height: 60 + Math.random() * 100,
                  top: `${10 + Math.random() * 40}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [-200, window?.innerWidth || 1000],
                }}
                transition={{
                  duration: 30 + Math.random() * 20,
                  repeat: Infinity,
                  delay: i * 5,
                  ease: 'linear',
                }}
              />
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {renderParticles()}
    </div>
  );
}
