# AviationWx / WeatherApp

A dual-mode weather application built with Next.js 16. Aviation mode (default) provides METAR/TAF data with VFR flight assessments for Cessna 172 aircraft. Weather mode offers general forecasting with dynamic backgrounds.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

**Live Demo:** [weather-app-five-ivory-48.vercel.app](https://weather-app-five-ivory-48.vercel.app)

## Aviation Mode (Default)

Aviation mode provides VFR flying assessments for Cessna 172 pilots:

- **VFR Assessment:** GO, CAUTION, or NO-GO based on C172 operating limits
- **METAR Display:** Decoded current observations with labeled values
- **TAF Display:** Terminal aerodrome forecast for planning
- **Flight Categories:** VFR, MVFR, IFR, LIFR determination
- **Factor Breakdown:** Individual assessment for ceiling, visibility, wind, crosswind, gusts, precipitation, thunderstorms
- **Flexible Search:** Enter ICAO code (CYYZ), city name (Toronto), or airport name (Pearson)
- **Dynamic Backgrounds:** Green for GO, yellow for CAUTION, red for NO-GO

### Cessna 172 VFR Limits

| Factor | GO | CAUTION | NO-GO |
|--------|-----|---------|-------|
| Ceiling | 3000+ ft | 1500-3000 ft | <1500 ft |
| Visibility | 5+ SM | 3-5 SM | <3 SM |
| Wind | <15 kts | 15-20 kts | >20 kts |
| Crosswind | <12 kts | 12-15 kts | >15 kts |
| Gusts | <20 kts | 20-25 kts | >25 kts |

## Weather Mode

Weather mode provides general weather forecasting:

- **Real-time Weather Data:** Current conditions for any city worldwide
- **5-Day Forecast:** View upcoming weather predictions
- **Dynamic Backgrounds:** Gradients change based on weather conditions
- **Day/Night Mode:** Automatic detection based on sunrise/sunset
- **Geolocation:** Use your current location
- **Weather Animations:** Animated particles (rain, snow, stars, clouds)
- **Glassmorphic UI:** Modern glass-effect design

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| UI Components | shadcn/ui, Radix UI |
| Icons | Lucide React |
| Aviation API | aviationweather.gov |
| Weather API | OpenWeatherMap |

## Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- npm or yarn
- OpenWeatherMap API key (for weather mode)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mateenali66/Weather-forecast-openweather.git
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your OpenWeatherMap API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys

**Aviation Mode:** No API key required. Uses aviationweather.gov free API.

**Weather Mode:** Get a free key from [OpenWeatherMap](https://openweathermap.org/api):
1. Sign up for a free account
2. Navigate to "API Keys" in your profile
3. Generate a new API key
4. Copy the key to your `.env.local` file

## Project Structure

```
weather-app/
├── app/
│   ├── api/
│   │   ├── weather/route.ts    # OpenWeatherMap proxy
│   │   └── aviation/route.ts   # aviationweather.gov proxy
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main page with mode toggle
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── airport-search.tsx      # Aviation search component
│   ├── aviation-display.tsx    # Aviation mode container
│   ├── vfr-assessment.tsx      # GO/CAUTION/NO-GO card
│   ├── metar-display.tsx       # Decoded METAR/TAF
│   ├── animated-background.tsx # Weather particles
│   ├── forecast-display.tsx    # 5-day forecast
│   ├── search-location.tsx     # Weather search
│   ├── weather-display.tsx     # Current weather
│   └── weather-icon.tsx        # Condition icons
├── lib/
│   ├── aviation-types.ts       # Aviation TypeScript types
│   ├── aviation-utils.ts       # VFR assessment logic
│   ├── types.ts                # Weather TypeScript types
│   └── weather-utils.ts        # Weather utilities
└── ...
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add the `OPENWEATHER_API_KEY` environment variable
4. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENWEATHER_API_KEY` | For weather mode | Your OpenWeatherMap API key |

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Credits

- Aviation data provided by [aviationweather.gov](https://aviationweather.gov/)
- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Lucide](https://lucide.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
