'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchLocationProps {
  onSearch: (city: string) => void;
  onUseLocation: () => void;
  isLoading: boolean;
  locationLoading: boolean;
}

export function SearchLocation({
  onSearch,
  onUseLocation,
  isLoading,
  locationLoading,
}: SearchLocationProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const clearQuery = () => {
    setQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`
            relative flex items-center gap-2 p-1.5 rounded-2xl
            bg-white/10 backdrop-blur-xl border transition-all duration-300
            ${isFocused ? 'border-white/40 shadow-lg shadow-black/10' : 'border-white/20'}
          `}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-white/50" />
            <Input
              type="text"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="
                w-full pl-12 pr-10 py-3 bg-transparent border-none
                text-white placeholder:text-white/40
                focus-visible:ring-0 focus-visible:ring-offset-0
                text-lg font-light tracking-wide
              "
              disabled={isLoading}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={clearQuery}
                  className="absolute right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onUseLocation}
              disabled={locationLoading || isLoading}
              className="
                h-11 w-11 rounded-xl bg-white/10 hover:bg-white/20
                text-white/70 hover:text-white transition-all
              "
              title="Use my location"
            >
              {locationLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </Button>

            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="
                h-11 px-6 rounded-xl
                bg-white/20 hover:bg-white/30
                text-white font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </motion.div>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/40 text-sm mt-3 font-light"
      >
        Enter a city name or use your current location
      </motion.p>
    </motion.div>
  );
}
