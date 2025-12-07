'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plane, MapPin } from 'lucide-react';
import { CANADIAN_AIRPORTS, Airport } from '@/lib/aviation-types';
import { searchAirports } from '@/lib/aviation-utils';

interface AirportSearchProps {
  onSearch: (location: string, runway?: number) => void;
  isLoading: boolean;
}

export function AirportSearch({ onSearch, isLoading }: AirportSearchProps) {
  const [query, setQuery] = useState('');
  const [runway, setRunway] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const matches = searchAirports(query);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const runwayNum = runway ? parseInt(runway) : undefined;
      onSearch(query.trim(), runwayNum);
      setShowSuggestions(false);
    }
  };

  const handleSelectAirport = (airport: Airport) => {
    setQuery(airport.icao);
    setShowSuggestions(false);
    const runwayNum = runway ? parseInt(runway) : undefined;
    onSearch(airport.icao, runwayNum);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectAirport(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main search input */}
        <div className="relative" ref={suggestionsRef}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="CYYZ, Toronto, or airport name"
              className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl
                       text-white placeholder-white/50 focus:outline-none focus:ring-2
                       focus:ring-white/30 transition-all uppercase"
              disabled={isLoading}
            />
            <Plane className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute w-full mt-2 bg-slate-800/95 backdrop-blur-lg border border-white/10
                         rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {suggestions.map((airport, index) => (
                  <button
                    key={airport.icao}
                    type="button"
                    onClick={() => handleSelectAirport(airport)}
                    className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors
                              ${index === selectedIndex ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  >
                    <MapPin className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">
                        <span className="text-emerald-400">{airport.icao}</span>
                        <span className="text-white/50 mx-2">|</span>
                        {airport.city}
                      </div>
                      <div className="text-white/50 text-sm">{airport.name}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Runway input (optional) */}
        <div className="flex gap-2">
          <input
            type="text"
            value={runway}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 36)) {
                setRunway(val);
              }
            }}
            placeholder="Runway (e.g. 26)"
            className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg
                     text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2
                     focus:ring-white/30 transition-all"
            maxLength={2}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/5
                     disabled:cursor-not-allowed rounded-lg text-white font-medium
                     transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Plane className="h-5 w-5" />
              </motion.div>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Get Weather
              </>
            )}
          </button>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CANADIAN_AIRPORTS.slice(0, 6).map((airport) => (
            <button
              key={airport.icao}
              type="button"
              onClick={() => handleSelectAirport(airport)}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full
                       text-white/70 hover:text-white transition-all disabled:opacity-50"
            >
              {airport.icao}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
