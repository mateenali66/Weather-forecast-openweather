import {
  MetarResponse,
  TafResponse,
  VfrAssessment,
  AssessmentStatus,
  FactorAssessment,
  FlightCategory,
  CloudLayer,
  C172_LIMITS,
  CANADIAN_AIRPORTS,
  Airport,
} from './aviation-types';

/**
 * Get ceiling (lowest BKN or OVC layer) from cloud layers
 * Returns feet AGL, or null if no ceiling (clear/few/scattered only)
 */
export function getCeilingFromClouds(clouds: CloudLayer[]): number | null {
  if (!clouds || clouds.length === 0) return null;

  for (const layer of clouds) {
    if (layer.cover === 'BKN' || layer.cover === 'OVC') {
      return layer.base;
    }
  }

  return null; // No ceiling (VFR unlimited)
}

/**
 * Get flight category based on ceiling and visibility
 */
export function getFlightCategory(
  ceiling: number | null,
  visibility: number | null
): FlightCategory {
  const cig = ceiling ?? 99999;
  const vis = visibility ?? 99;

  if (cig < 500 || vis < 1) return 'LIFR';
  if (cig < 1000 || vis < 3) return 'IFR';
  if (cig <= 3000 || vis <= 5) return 'MVFR';
  return 'VFR';
}

/**
 * Calculate crosswind component given wind direction, speed, and runway heading
 * Returns crosswind in knots
 */
export function calculateCrosswind(
  windDir: number | string | null,
  windSpeed: number | null,
  runwayHeading: number = 0
): number {
  if (windDir === null || windDir === 'VRB' || windSpeed === null) {
    return 0;
  }

  const dir = typeof windDir === 'string' ? parseInt(windDir) : windDir;
  const angleDiff = Math.abs(dir - runwayHeading);
  const normalizedAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff;

  return Math.round(windSpeed * Math.sin(normalizedAngle * Math.PI / 180));
}

/**
 * Parse visibility value (can be number or "10+" string)
 */
export function parseVisibility(visib: number | string | null): number {
  if (visib === null) return 10;
  if (typeof visib === 'string') {
    if (visib.includes('+')) return 10;
    return parseFloat(visib) || 10;
  }
  return visib;
}

/**
 * Check if weather string contains precipitation
 */
export function hasPrecipitation(wxString?: string): { has: boolean; type: string; severity: 'light' | 'moderate' | 'heavy' | 'none' } {
  if (!wxString) return { has: false, type: '', severity: 'none' };

  const wx = wxString.toUpperCase();

  // Check for heavy precipitation
  if (wx.includes('+RA') || wx.includes('+SN') || wx.includes('+FZRA') || wx.includes('+TSRA')) {
    const type = wx.includes('SN') ? 'snow' : wx.includes('FZRA') ? 'freezing rain' : 'rain';
    return { has: true, type, severity: 'heavy' };
  }

  // Check for freezing precipitation (always NO-GO)
  if (wx.includes('FZRA') || wx.includes('FZDZ') || wx.includes('FZFG')) {
    return { has: true, type: 'freezing precipitation', severity: 'heavy' };
  }

  // Check for moderate precipitation
  if (wx.includes('RA') || wx.includes('SN') || wx.includes('DZ') || wx.includes('SH')) {
    const type = wx.includes('SN') ? 'snow' : wx.includes('DZ') ? 'drizzle' : 'rain';
    // Check if it's light (prefixed with -)
    if (wx.includes('-RA') || wx.includes('-SN') || wx.includes('-DZ')) {
      return { has: true, type, severity: 'light' };
    }
    return { has: true, type, severity: 'moderate' };
  }

  return { has: false, type: '', severity: 'none' };
}

/**
 * Check if weather string contains thunderstorms
 */
export function hasThunderstorms(wxString?: string): boolean {
  if (!wxString) return false;
  return wxString.toUpperCase().includes('TS');
}

/**
 * Assess VFR conditions for Cessna 172 based on METAR data
 */
export function assessVfrConditions(
  metar: MetarResponse,
  _taf?: TafResponse | null,
  runwayHeading: number = 0
): VfrAssessment {
  const factors: VfrAssessment['factors'] = {
    ceiling: assessCeiling(metar.clouds),
    visibility: assessVisibility(metar.visib),
    wind: assessWind(metar.wspd),
    crosswind: assessCrosswind(metar.wdir, metar.wspd, runwayHeading),
    gusts: assessGusts(metar.wgst),
    precipitation: assessPrecipitation(metar.wxString),
    thunderstorms: assessThunderstorms(metar.wxString),
  };

  // Determine overall status
  const statuses = Object.values(factors).map(f => f.status);
  let overall: AssessmentStatus = 'GO';

  if (statuses.includes('NO-GO')) {
    overall = 'NO-GO';
  } else if (statuses.includes('CAUTION')) {
    overall = 'CAUTION';
  }

  // Get flight category (handle both API variants: fltcat and fltCat)
  const ceiling = getCeilingFromClouds(metar.clouds);
  const visibility = parseVisibility(metar.visib);
  const flightCategory = metar.fltcat || metar.fltCat || getFlightCategory(ceiling, visibility);

  // Generate recommendation
  const recommendation = generateRecommendation(overall, factors, flightCategory);

  return {
    overall,
    factors,
    flightCategory,
    recommendation,
  };
}

function assessCeiling(clouds: CloudLayer[]): FactorAssessment {
  const ceiling = getCeilingFromClouds(clouds);

  if (ceiling === null) {
    return { status: 'GO', value: undefined, message: 'Clear or no ceiling' };
  }

  if (ceiling >= C172_LIMITS.ceiling.go) {
    return { status: 'GO', value: ceiling, message: `${ceiling} ft AGL` };
  }

  if (ceiling >= C172_LIMITS.ceiling.caution) {
    return { status: 'CAUTION', value: ceiling, message: `${ceiling} ft AGL (marginal)` };
  }

  return { status: 'NO-GO', value: ceiling, message: `${ceiling} ft AGL (too low)` };
}

function assessVisibility(visib: number | string | null): FactorAssessment {
  const vis = parseVisibility(visib);

  if (vis >= C172_LIMITS.visibility.go) {
    return { status: 'GO', value: vis, message: `${vis}+ SM` };
  }

  if (vis >= C172_LIMITS.visibility.caution) {
    return { status: 'CAUTION', value: vis, message: `${vis} SM (marginal)` };
  }

  return { status: 'NO-GO', value: vis, message: `${vis} SM (too low)` };
}

function assessWind(wspd: number | null): FactorAssessment {
  if (wspd === null || wspd === 0) {
    return { status: 'GO', value: 0, message: 'Calm' };
  }

  if (wspd <= C172_LIMITS.wind.go) {
    return { status: 'GO', value: wspd, message: `${wspd} kts` };
  }

  if (wspd <= C172_LIMITS.wind.caution) {
    return { status: 'CAUTION', value: wspd, message: `${wspd} kts (gusty)` };
  }

  return { status: 'NO-GO', value: wspd, message: `${wspd} kts (too strong)` };
}

function assessCrosswind(
  wdir: number | string | null,
  wspd: number | null,
  runwayHeading: number
): FactorAssessment {
  if (wspd === null || wspd === 0 || runwayHeading === 0) {
    return { status: 'GO', value: 0, message: 'N/A (no runway specified)' };
  }

  const xwind = calculateCrosswind(wdir, wspd, runwayHeading);

  if (xwind <= C172_LIMITS.crosswind.go) {
    return { status: 'GO', value: xwind, message: `${xwind} kts` };
  }

  if (xwind <= C172_LIMITS.crosswind.caution) {
    return { status: 'CAUTION', value: xwind, message: `${xwind} kts (at limit)` };
  }

  return { status: 'NO-GO', value: xwind, message: `${xwind} kts (exceeds limit)` };
}

function assessGusts(wgst: number | null | undefined): FactorAssessment {
  if (wgst === null || wgst === undefined || wgst === 0) {
    return { status: 'GO', value: undefined, message: 'None' };
  }

  if (wgst <= C172_LIMITS.gusts.go) {
    return { status: 'GO', value: wgst, message: `${wgst} kts` };
  }

  if (wgst <= C172_LIMITS.gusts.caution) {
    return { status: 'CAUTION', value: wgst, message: `${wgst} kts (strong)` };
  }

  return { status: 'NO-GO', value: wgst, message: `${wgst} kts (too strong)` };
}

function assessPrecipitation(wxString?: string): FactorAssessment {
  const precip = hasPrecipitation(wxString);

  if (!precip.has) {
    return { status: 'GO', message: 'None' };
  }

  if (precip.severity === 'light') {
    return { status: 'CAUTION', message: `Light ${precip.type}` };
  }

  if (precip.severity === 'moderate') {
    return { status: 'CAUTION', message: `${precip.type}` };
  }

  return { status: 'NO-GO', message: `Heavy ${precip.type}` };
}

function assessThunderstorms(wxString?: string): FactorAssessment {
  if (!hasThunderstorms(wxString)) {
    return { status: 'GO', message: 'None' };
  }

  return { status: 'NO-GO', message: 'Thunderstorms reported' };
}

function generateRecommendation(
  overall: AssessmentStatus,
  factors: VfrAssessment['factors'],
  flightCategory: FlightCategory
): string {
  if (overall === 'GO' && flightCategory === 'VFR') {
    return 'Conditions are suitable for VFR flight in a Cessna 172.';
  }

  if (overall === 'NO-GO') {
    const noGoFactors = Object.entries(factors)
      .filter(([, f]) => f.status === 'NO-GO')
      .map(([name]) => name);

    if (noGoFactors.includes('thunderstorms')) {
      return 'Flight not recommended due to thunderstorm activity. Wait for conditions to improve.';
    }

    if (noGoFactors.includes('ceiling') || noGoFactors.includes('visibility')) {
      return `Flight not recommended. Conditions are ${flightCategory}, which requires instrument rating and IFR clearance.`;
    }

    return `Flight not recommended due to: ${noGoFactors.join(', ')}. Wait for conditions to improve.`;
  }

  // CAUTION
  const cautionFactors = Object.entries(factors)
    .filter(([, f]) => f.status === 'CAUTION')
    .map(([name]) => name);

  return `Exercise caution. Consider: ${cautionFactors.join(', ')}. Conditions may be challenging for low-time pilots.`;
}

/**
 * Format METAR observation time
 */
export function formatMetarTime(obsTime: number): string {
  const date = new Date(obsTime * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Get time ago string from observation time
 */
export function getTimeAgo(obsTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - obsTime;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 7200) return '1 hour ago';
  return `${Math.floor(diff / 3600)} hours ago`;
}

/**
 * Get background gradient for aviation mode based on assessment
 */
export function getAviationGradient(status: AssessmentStatus): string {
  switch (status) {
    case 'GO':
      return 'from-emerald-500 via-green-600 to-teal-700';
    case 'CAUTION':
      return 'from-amber-400 via-orange-500 to-yellow-600';
    case 'NO-GO':
      return 'from-red-500 via-rose-600 to-red-800';
    default:
      return 'from-slate-600 via-gray-700 to-slate-800';
  }
}

/**
 * Search airports by ICAO code, name, or city
 */
export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase().trim();

  return CANADIAN_AIRPORTS.filter(airport =>
    airport.icao.toLowerCase().includes(q) ||
    airport.name.toLowerCase().includes(q) ||
    airport.city.toLowerCase().includes(q)
  );
}

/**
 * Check if a string looks like an ICAO code
 */
export function isIcaoCode(str: string): boolean {
  return /^[A-Z]{4}$/i.test(str.trim());
}

/**
 * Normalize input to ICAO code
 * Accepts: ICAO code, airport name, or city name
 * Returns: ICAO code or null if not found
 */
export function normalizeToIcao(input: string): string | null {
  const trimmed = input.trim().toUpperCase();

  // If it's already an ICAO code format, return it
  if (isIcaoCode(trimmed)) {
    return trimmed;
  }

  // Search for matching airport
  const matches = searchAirports(input);
  if (matches.length > 0) {
    return matches[0].icao;
  }

  return null;
}

/**
 * Decode cloud cover abbreviation
 */
export function decodeCloudCover(cover: string): string {
  const covers: Record<string, string> = {
    'CLR': 'Clear below 12,000 ft',
    'SKC': 'Sky clear',
    'NSC': 'No significant cloud',
    'NCD': 'No cloud detected',
    'FEW': 'Few (1-2 oktas)',
    'SCT': 'Scattered (3-4 oktas)',
    'BKN': 'Broken (5-7 oktas)',
    'OVC': 'Overcast (8 oktas)',
  };
  return covers[cover] || cover;
}

/**
 * Decode wind direction to compass direction
 */
export function decodeWindDirection(wdir: number | string | null): string {
  if (wdir === null) return 'Calm';
  if (wdir === 'VRB') return 'Variable';

  const dir = typeof wdir === 'string' ? parseInt(wdir) : wdir;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(dir / 22.5) % 16;
  return `${directions[index]} (${dir}°)`;
}
