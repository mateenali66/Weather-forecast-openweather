# WeatherApp

A beautiful, modern weather application built with Next.js 16, featuring real-time weather forecasts, dynamic backgrounds that change based on weather conditions, and a stunning glassmorphic UI design.

![Weather App](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

**Live Demo:** [weather-app-five-ivory-48.vercel.app](https://weather-app-five-ivory-48.vercel.app)

## Features

- **Real-time Weather Data**: Get current weather conditions for any city worldwide
- **5-Day Forecast**: View upcoming weather predictions
- **Dynamic Backgrounds**: Background gradients change based on weather conditions (clear, cloudy, rain, snow, etc.)
- **Day/Night Mode**: Automatic detection based on sunrise/sunset times
- **Geolocation**: Use your current location to get local weather
- **Weather Animations**: Animated weather particles (rain, snow, stars, clouds)
- **Glassmorphic UI**: Modern, beautiful glass-effect design
- **Responsive**: Works perfectly on desktop and mobile devices
- **Persistent Preferences**: Remembers your last searched city

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **API**: OpenWeatherMap

## Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- npm or yarn
- OpenWeatherMap API key (free tier available)

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

## API Key

Get your free API key from [OpenWeatherMap](https://openweathermap.org/api):

1. Sign up for a free account
2. Navigate to "API Keys" in your profile
3. Generate a new API key
4. Copy the key to your `.env.local` file

## Project Structure

```
weather-app/
├── app/
│   ├── api/weather/     # Weather API route
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── animated-background.tsx
│   ├── forecast-display.tsx
│   ├── search-location.tsx
│   ├── weather-display.tsx
│   └── weather-icon.tsx
├── lib/
│   ├── types.ts         # TypeScript types
│   ├── utils.ts         # Utility functions
│   └── weather-utils.ts # Weather-specific utilities
└── ...
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add the `OPENWEATHER_API_KEY` environment variable
4. Deploy!

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API key |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Lucide](https://lucide.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
