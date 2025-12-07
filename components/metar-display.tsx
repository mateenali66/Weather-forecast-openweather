'use client';

import { motion } from 'framer-motion';
import { Clock, Thermometer, Droplets, Wind, Eye, Gauge, Cloud } from 'lucide-react';
import { MetarResponse, TafResponse } from '@/lib/aviation-types';
import {
  formatMetarTime,
  getTimeAgo,
  getCeilingFromClouds,
  decodeCloudCover,
  decodeWindDirection,
  parseVisibility,
} from '@/lib/aviation-utils';

interface MetarDisplayProps {
  metar: MetarResponse;
  taf?: TafResponse | null;
}

function DataCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <Icon className="h-5 w-5 text-white/50" />
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-white font-medium">
          {value ?? 'N/A'}
          {unit && <span className="text-white/60 text-sm ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function MetarDisplay({ metar, taf }: MetarDisplayProps) {
  const ceiling = getCeilingFromClouds(metar.clouds);
  const visibility = parseVisibility(metar.visib);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Raw METAR */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Current METAR
          </h3>
          <span className="text-white/50 text-sm">
            {formatMetarTime(metar.obsTime)} ({getTimeAgo(metar.obsTime)})
          </span>
        </div>
        <code className="block text-emerald-300 text-sm font-mono bg-black/20 p-3 rounded-lg overflow-x-auto">
          {metar.rawOb}
        </code>
        {metar.name && (
          <p className="text-white/50 text-sm mt-2">{metar.name}</p>
        )}
      </div>

      {/* Decoded Data Grid */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
        <h3 className="text-white font-semibold mb-3">Decoded Weather</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <DataCard
            icon={Thermometer}
            label="Temperature"
            value={metar.temp !== null ? Math.round(metar.temp) : null}
            unit="°C"
          />
          <DataCard
            icon={Droplets}
            label="Dewpoint"
            value={metar.dewp !== null ? Math.round(metar.dewp) : null}
            unit="°C"
          />
          <DataCard
            icon={Wind}
            label="Wind"
            value={
              metar.wdir === null || metar.wspd === 0
                ? 'Calm'
                : `${decodeWindDirection(metar.wdir)} @ ${metar.wspd}${metar.wgst ? `G${metar.wgst}` : ''}`
            }
            unit={metar.wspd && metar.wspd > 0 ? 'kts' : undefined}
          />
          <DataCard
            icon={Eye}
            label="Visibility"
            value={visibility >= 10 ? '10+' : visibility}
            unit="SM"
          />
          <DataCard
            icon={Gauge}
            label="Altimeter"
            value={metar.altim !== null ? metar.altim.toFixed(2) : null}
            unit="hPa"
          />
          <DataCard
            icon={Cloud}
            label="Ceiling"
            value={ceiling !== null ? `${ceiling}` : 'Unlimited'}
            unit={ceiling !== null ? 'ft AGL' : undefined}
          />
        </div>

        {/* Cloud Layers */}
        {metar.clouds && metar.clouds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-2">Cloud Layers:</p>
            <div className="flex flex-wrap gap-2">
              {metar.clouds.map((layer, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 text-xs rounded-full ${
                    layer.cover === 'BKN' || layer.cover === 'OVC'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {layer.cover} @ {layer.base} ft
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weather Phenomena */}
        {metar.wxString && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-2">Weather:</p>
            <span className="px-2 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full">
              {metar.wxString}
            </span>
          </div>
        )}
      </div>

      {/* TAF if available */}
      {taf && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
          <h3 className="text-white font-semibold mb-3">TAF Forecast</h3>
          <code className="block text-blue-300 text-sm font-mono bg-black/20 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {taf.rawTAF}
          </code>
          <p className="text-white/50 text-xs mt-2">
            Valid: {new Date(taf.validTimeFrom * 1000).toLocaleString()} to{' '}
            {new Date(taf.validTimeTo * 1000).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}
