'use client';

import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import { AviationData } from '@/lib/aviation-types';
import { VfrAssessmentCard } from './vfr-assessment';
import { MetarDisplay } from './metar-display';

interface AviationDisplayProps {
  data: AviationData;
  airport: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AviationDisplay({
  data,
  airport,
  onRefresh,
  isRefreshing,
}: AviationDisplayProps) {
  if (!data.metar) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Airport Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">
            {airport.toUpperCase()}
          </h2>
          {data.metar.name && (
            <span className="text-white/50 text-sm hidden sm:inline">
              | {data.metar.name}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh weather"
        >
          <RefreshCw
            className={`h-5 w-5 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* VFR Assessment */}
      {data.assessment && <VfrAssessmentCard assessment={data.assessment} />}

      {/* METAR/TAF Display */}
      <MetarDisplay metar={data.metar} taf={data.taf} />
    </motion.div>
  );
}
