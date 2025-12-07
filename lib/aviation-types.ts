// Aviation Weather Types

export type FlightCategory = 'VFR' | 'MVFR' | 'IFR' | 'LIFR';

export type AssessmentStatus = 'GO' | 'CAUTION' | 'NO-GO';

export interface CloudLayer {
  cover: 'FEW' | 'SCT' | 'BKN' | 'OVC' | 'CLR' | 'SKC' | 'NSC' | 'NCD';
  base: number; // feet AGL
}

export interface MetarResponse {
  metar_id?: number;
  icaoId: string;
  receiptTime: string;
  obsTime: number;
  temp: number | null;
  dewp: number | null;
  wdir: number | string | null; // can be "VRB" for variable
  wspd: number | null;
  wgst: number | null;
  visib: number | string | null; // can be "10+" for unlimited
  altim: number | null;
  slp: number | null;
  fltcat?: FlightCategory; // lowercase variant
  fltCat?: FlightCategory; // camelCase variant from API
  clouds: CloudLayer[];
  rawOb: string;
  wxString?: string; // weather phenomena like RA, SN, TS, etc.
  name?: string; // airport name
}

export interface TafPeriod {
  timeFrom: number;
  timeTo: number;
  wdir: number | string | null;
  wspd: number | null;
  wgst: number | null;
  visib: number | string | null;
  clouds: CloudLayer[];
  wxString?: string;
  fltcat?: FlightCategory;
}

export interface TafResponse {
  taf_id: number;
  icaoId: string;
  dbPopTime: string;
  bulletinTime: string;
  issueTime: number;
  validTimeFrom: number;
  validTimeTo: number;
  rawTAF: string;
  fcsts: TafPeriod[];
  name?: string;
}

export interface FactorAssessment {
  status: AssessmentStatus;
  value?: number;
  message: string;
}

export interface VfrAssessment {
  overall: AssessmentStatus;
  factors: {
    ceiling: FactorAssessment;
    visibility: FactorAssessment;
    wind: FactorAssessment;
    crosswind: FactorAssessment;
    gusts: FactorAssessment;
    precipitation: FactorAssessment;
    thunderstorms: FactorAssessment;
  };
  flightCategory: FlightCategory;
  recommendation: string;
}

export interface AviationData {
  metar: MetarResponse | null;
  taf: TafResponse | null;
  assessment: VfrAssessment | null;
  error?: string;
}

export interface Airport {
  icao: string;
  name: string;
  city: string;
  province?: string;
}

// Common Canadian airports for quick selection
export const CANADIAN_AIRPORTS: Airport[] = [
  { icao: 'CYYZ', name: 'Toronto Pearson International', city: 'Toronto', province: 'ON' },
  { icao: 'CYTZ', name: 'Billy Bishop Toronto City', city: 'Toronto', province: 'ON' },
  { icao: 'CYKZ', name: 'Buttonville Municipal', city: 'Markham', province: 'ON' },
  { icao: 'CYHM', name: 'John C. Munro Hamilton International', city: 'Hamilton', province: 'ON' },
  { icao: 'CYOO', name: 'Oshawa Executive', city: 'Oshawa', province: 'ON' },
  { icao: 'CYKF', name: 'Region of Waterloo International', city: 'Waterloo', province: 'ON' },
  { icao: 'CYOW', name: 'Ottawa Macdonald-Cartier International', city: 'Ottawa', province: 'ON' },
  { icao: 'CYUL', name: 'Montreal Pierre Elliott Trudeau International', city: 'Montreal', province: 'QC' },
  { icao: 'CYVR', name: 'Vancouver International', city: 'Vancouver', province: 'BC' },
  { icao: 'CYYC', name: 'Calgary International', city: 'Calgary', province: 'AB' },
  { icao: 'CYEG', name: 'Edmonton International', city: 'Edmonton', province: 'AB' },
  { icao: 'CYWG', name: 'Winnipeg James Armstrong Richardson International', city: 'Winnipeg', province: 'MB' },
];

// Cessna 172 VFR operating limits
export const C172_LIMITS = {
  ceiling: {
    go: 3000,      // feet AGL
    caution: 1500, // feet AGL
  },
  visibility: {
    go: 5,         // statute miles
    caution: 3,    // statute miles
  },
  wind: {
    go: 15,        // knots
    caution: 20,   // knots
  },
  crosswind: {
    go: 12,        // knots (C172 demonstrated crosswind)
    caution: 15,   // knots
  },
  gusts: {
    go: 20,        // knots
    caution: 25,   // knots
  },
};
