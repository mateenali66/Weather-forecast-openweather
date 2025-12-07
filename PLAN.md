# Aviation Weather Feature Implementation Plan

## Overview

Expand the weather app to include aviation weather data from aviationweather.gov (which includes Canadian airports) with VFR flyability assessment for Cessna 172.

---

## Research Summary

### API Selection: aviationweather.gov (Recommended)

| Option | Pros | Cons |
|--------|------|------|
| **aviationweather.gov** | Free, no API key, includes Canadian airports, JSON format, 100 req/min | US-based but has global data |
| NAV CANADA CFPS | Official Canadian source | No public API, requires web scraping |
| CheckWX | Easy to use | Requires API key registration |

**Decision:** Use aviationweather.gov - it's free, requires no authentication, and includes Canadian airports (CYYZ, CYKZ, etc.)

### METAR/TAF Parsing: metar-taf-parser

- TypeScript library with full type definitions
- Parses raw METAR/TAF strings into structured objects
- 50+ stars, actively maintained
- Dependency-free, works in browser and Node

---

## Cessna 172 VFR Minimums

| Factor | Minimum | Caution | No-Go |
|--------|---------|---------|-------|
| Ceiling | 3000+ ft AGL | 1500-3000 ft | <1500 ft |
| Visibility | 5+ SM | 3-5 SM | <3 SM |
| Wind Speed | <15 kts | 15-20 kts | >20 kts |
| Crosswind | <12 kts | 12-15 kts | >15 kts |
| Gusts | <20 kts | 20-25 kts | >25 kts |
| Precipitation | None/Light | Moderate | Heavy/Freezing |
| Thunderstorms | None | Within 30nm | Within 20nm |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        App (page.tsx)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Weather   │  │  Aviation   │  │   Mode Toggle (Tabs)    │ │
│  │    Mode     │  │    Mode     │  │  [Weather] [Aviation]   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                   ┌───────────────────────┐
│  /api/weather     │                   │  /api/aviation        │
│  (OpenWeatherMap) │                   │  (aviationweather.gov)│
└───────────────────┘                   └───────────────────────┘
                                                    │
                                        ┌───────────┴───────────┐
                                        ▼                       ▼
                                   ┌─────────┐            ┌─────────┐
                                   │  METAR  │            │   TAF   │
                                   │ Parsing │            │ Parsing │
                                   └─────────┘            └─────────┘
```

---

## Implementation Steps

### Phase 1: API Integration

**1.1 Create Aviation API Route**
- File: `app/api/aviation/route.ts`
- Endpoints:
  - `GET /api/aviation?icao=CYYZ` - Fetch METAR
  - `GET /api/aviation?icao=CYYZ&type=taf` - Fetch TAF
- Proxy to: `https://aviationweather.gov/api/data/metar?ids={icao}&format=json`

**1.2 Install Dependencies**
```bash
npm install metar-taf-parser
```

**1.3 Create Aviation Types**
- File: `lib/aviation-types.ts`
- Types: `MetarData`, `TafData`, `VfrAssessment`, `FlightCategory`

### Phase 2: VFR Decision Logic

**2.1 Create Aviation Utilities**
- File: `lib/aviation-utils.ts`
- Functions:
  - `assessVfrConditions(metar, taf)` - Returns VFR assessment
  - `calculateCrosswind(windDir, windSpeed, runwayHeading)` - Crosswind component
  - `getFlightCategory(ceiling, visibility)` - VFR/MVFR/IFR/LIFR
  - `getCeilingFromClouds(clouds)` - Extract ceiling from cloud layers
  - `formatMetarTime(time)` - Format observation time

**2.2 VFR Assessment Logic**
```typescript
interface VfrAssessment {
  overall: 'GO' | 'CAUTION' | 'NO-GO';
  factors: {
    ceiling: { status: Status; value: number; message: string };
    visibility: { status: Status; value: number; message: string };
    wind: { status: Status; speed: number; gusts?: number; message: string };
    crosswind: { status: Status; component: number; message: string };
    precipitation: { status: Status; type?: string; message: string };
    thunderstorms: { status: Status; message: string };
  };
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  recommendation: string;
}
```

### Phase 3: UI Components

**3.1 Airport Search Component**
- File: `components/airport-search.tsx`
- Features:
  - ICAO code input (e.g., CYYZ, CYKZ)
  - Common Canadian airports dropdown
  - Geolocation to find nearest airport

**3.2 Aviation Display Component**
- File: `components/aviation-display.tsx`
- Sections:
  - VFR Assessment Card (GO/CAUTION/NO-GO with color coding)
  - Current METAR (decoded)
  - TAF Forecast (next 24h)
  - Factor breakdown cards

**3.3 VFR Assessment Card**
- File: `components/vfr-assessment.tsx`
- Visual traffic light system (green/yellow/red)
- Expandable factor details
- Cessna 172 specific recommendations

**3.4 METAR Display Component**
- File: `components/metar-display.tsx`
- Raw METAR string
- Decoded values with explanations
- Observation time and age

### Phase 4: App Integration

**4.1 Add Mode Toggle**
- Update `app/page.tsx`
- Add tabs: "Weather" | "Aviation"
- Persist mode preference in localStorage

**4.2 Aviation Mode State**
- Add state for: `metar`, `taf`, `vfrAssessment`, `selectedAirport`
- Fetch aviation data when airport is selected

**4.3 Background Theming**
- Green gradient for VFR GO
- Yellow/Orange for CAUTION
- Red gradient for NO-GO

---

## File Structure (New Files)

```
weather-app/
├── app/
│   └── api/
│       └── aviation/
│           └── route.ts          # NEW: Aviation API route
├── components/
│   ├── airport-search.tsx        # NEW: Airport search
│   ├── aviation-display.tsx      # NEW: Main aviation view
│   ├── vfr-assessment.tsx        # NEW: GO/NO-GO card
│   └── metar-display.tsx         # NEW: METAR details
└── lib/
    ├── aviation-types.ts         # NEW: Aviation types
    └── aviation-utils.ts         # NEW: VFR logic
```

---

## Canadian Airport Examples

| Airport | ICAO | Location |
|---------|------|----------|
| Toronto Pearson | CYYZ | Toronto, ON |
| Billy Bishop | CYTZ | Toronto, ON |
| Buttonville | CYKZ | Markham, ON |
| Hamilton | CYHM | Hamilton, ON |
| Oshawa | CYOO | Oshawa, ON |
| Ottawa | CYOW | Ottawa, ON |
| Montreal | CYUL | Montreal, QC |
| Vancouver | CYVR | Vancouver, BC |
| Calgary | CYYC | Calgary, AB |

---

## API Examples

### METAR Request
```
GET https://aviationweather.gov/api/data/metar?ids=CYYZ&format=json
```

### METAR Response (JSON)
```json
[{
  "metar_id": 494026812,
  "icaoId": "CYYZ",
  "receiptTime": "2024-01-15 14:00:00",
  "obsTime": 1705327200,
  "temp": -5.0,
  "dewp": -10.0,
  "wdir": 270,
  "wspd": 15,
  "wgst": 25,
  "visib": 9,
  "altim": 1013.2,
  "slp": 1015.0,
  "fltcat": "VFR",
  "clouds": [
    {"cover": "FEW", "base": 2500},
    {"cover": "SCT", "base": 5000}
  ],
  "rawOb": "CYYZ 151400Z 27015G25KT 9SM FEW025 SCT050 M05/M10 A2993"
}]
```

### TAF Request
```
GET https://aviationweather.gov/api/data/taf?ids=CYYZ&format=json
```

---

## UI Mockup (Text)

```
┌─────────────────────────────────────────────────┐
│  [Weather]  [✈ Aviation]                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔍 [CYYZ____________] [📍] [Search]            │
│     Toronto Pearson International               │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           ✅ VFR - GO                    │   │
│  │     Conditions suitable for flight       │   │
│  │                                          │   │
│  │  Ceiling    5000 ft   ✓                 │   │
│  │  Visibility   9 SM    ✓                 │   │
│  │  Wind       15 kts    ✓                 │   │
│  │  Gusts      25 kts    ⚠                 │   │
│  │  Crosswind   8 kts    ✓                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📋 Current METAR (14:00Z - 15 min ago)        │
│  CYYZ 151400Z 27015G25KT 9SM FEW025 SCT050    │
│  M05/M10 A2993                                 │
│                                                 │
│  📊 TAF Forecast                               │
│  [14:00] [16:00] [18:00] [20:00] [22:00]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] METAR fetch for Canadian airports (CYYZ, CYKZ)
- [ ] TAF fetch and parsing
- [ ] VFR assessment accuracy
- [ ] Crosswind calculation
- [ ] Flight category determination
- [ ] Error handling (invalid ICAO, no data)
- [ ] Mobile responsiveness
- [ ] Mode persistence

---

## Future Enhancements (Out of Scope)

- NOTAMs integration
- GFA (Graphical Area Forecast) display
- Route weather planning (departure to destination)
- Weather radar overlay
- Pilot reports (PIREPs)
- Aircraft-specific profiles (not just C172)
