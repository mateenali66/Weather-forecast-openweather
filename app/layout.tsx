import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeatherApp - Beautiful Weather Forecasts",
  description: "A beautiful, modern weather application with real-time forecasts, dynamic backgrounds, and 5-day predictions. Built with Next.js and OpenWeatherMap API.",
  keywords: ["weather", "forecast", "weather app", "temperature", "humidity", "wind", "openweathermap"],
  authors: [{ name: "Mateen Ali" }],
  creator: "Mateen Ali",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "WeatherApp - Beautiful Weather Forecasts",
    description: "A beautiful, modern weather application with real-time forecasts and dynamic backgrounds.",
    siteName: "WeatherApp",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeatherApp - Beautiful Weather Forecasts",
    description: "A beautiful, modern weather application with real-time forecasts and dynamic backgrounds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
