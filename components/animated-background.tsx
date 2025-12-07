'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { WeatherCondition } from '@/lib/types';

interface AnimatedBackgroundProps {
  condition: WeatherCondition;
  isDay: boolean;
}

// Generate stable random values for particles
function generateParticleData(count: number, seed: number = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + seed,
    left: ((i * 17 + seed) % 100),
    top: ((i * 23 + seed) % 60),
    duration: 1 + (i % 5) * 0.1,
    delay: (i % 10) * 0.2,
    xOffset: ((i * 7) % 50) - 25,
    size: 100 + (i % 3) * 100,
    height: 60 + (i % 4) * 25,
  }));
}

export function AnimatedBackground({ condition, isDay }: AnimatedBackgroundProps) {
  // Memoize particle data to avoid regenerating on each render
  const rainParticles = useMemo(() => generateParticleData(50, 1), []);
  const snowParticles = useMemo(() => generateParticleData(40, 2), []);
  const starParticles = useMemo(() => generateParticleData(20, 3), []);
  const cloudParticles = useMemo(() => generateParticleData(5, 4), []);
  const thunderDelay = useMemo(() => 5, []);

  const renderParticles = () => {
    switch (condition) {
      case 'rain':
      case 'drizzle':
        return (
          <>
            {rainParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-0.5 h-4 bg-blue-300/30 rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: -20,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  opacity: [0.3, 0.7, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'linear',
                }}
              />
            ))}
          </>
        );

      case 'snow':
        return (
          <>
            {snowParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: -20,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, p.xOffset],
                  rotate: [0, 360],
                  opacity: [0.4, 0.8, 0],
                }}
                transition={{
                  duration: 5 + p.duration,
                  repeat: Infinity,
                  delay: p.delay,
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
              repeatDelay: thunderDelay,
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
              {starParticles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute w-1 h-1 bg-white/50 rounded-full"
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                  }}
                />
              ))}
            </>
          );
        }

      case 'clouds':
        return (
          <>
            {cloudParticles.map((p, i) => (
              <motion.div
                key={p.id}
                className="absolute bg-white/5 rounded-full blur-2xl"
                style={{
                  width: p.size,
                  height: p.height,
                  top: `${10 + p.top * 0.5}%`,
                  left: `${p.left}%`,
                }}
                animate={{
                  x: [-200, 1000],
                }}
                transition={{
                  duration: 30 + p.duration * 10,
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
