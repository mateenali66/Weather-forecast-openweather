import { NextRequest, NextResponse } from 'next/server';
import { MetarResponse, TafResponse, AviationData } from '@/lib/aviation-types';
import { assessVfrConditions, normalizeToIcao } from '@/lib/aviation-utils';

const AVIATION_WEATHER_BASE = 'https://aviationweather.gov/api/data';

interface ApiError {
  error: string;
  details?: string;
}

async function fetchMetar(icao: string): Promise<MetarResponse | null> {
  const url = `${AVIATION_WEATHER_BASE}/metar?ids=${icao}&format=json`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`METAR fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data[0] as MetarResponse;
    }

    return null;
  } catch (error) {
    console.error('METAR fetch error:', error);
    return null;
  }
}

async function fetchTaf(icao: string): Promise<TafResponse | null> {
  const url = `${AVIATION_WEATHER_BASE}/taf?ids=${icao}&format=json`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`TAF fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data[0] as TafResponse;
    }

    return null;
  } catch (error) {
    console.error('TAF fetch error:', error);
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<AviationData | ApiError>> {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const type = searchParams.get('type') || 'all'; // metar, taf, or all
  const runway = searchParams.get('runway'); // optional runway heading for crosswind calc

  if (!location) {
    return NextResponse.json(
      { error: 'Location parameter is required' },
      { status: 400 }
    );
  }

  // Normalize input to ICAO code
  const icao = normalizeToIcao(location);

  // If we couldn't find a known airport, try the input directly
  // (it might be a valid ICAO we don't have in our list)
  const icaoCode = icao || location.toUpperCase().trim();

  // Validate ICAO format (should be 4 letters)
  if (!/^[A-Z]{4}$/.test(icaoCode)) {
    return NextResponse.json(
      {
        error: 'Invalid airport identifier',
        details: `Could not find airport for "${location}". Try an ICAO code like CYYZ or airport name.`,
      },
      { status: 400 }
    );
  }

  const runwayHeading = runway ? parseInt(runway) * 10 : 0; // Convert runway number to heading

  try {
    let metar: MetarResponse | null = null;
    let taf: TafResponse | null = null;

    // Fetch requested data
    if (type === 'metar' || type === 'all') {
      metar = await fetchMetar(icaoCode);
    }

    if (type === 'taf' || type === 'all') {
      taf = await fetchTaf(icaoCode);
    }

    // If no METAR found, the airport may not exist or have no reports
    if (type !== 'taf' && !metar) {
      return NextResponse.json(
        {
          error: 'No METAR data available',
          details: `No weather data found for ${icaoCode}. The airport may not report weather or the code may be invalid.`,
        },
        { status: 404 }
      );
    }

    // Calculate VFR assessment if we have METAR data
    const assessment = metar ? assessVfrConditions(metar, taf, runwayHeading) : null;

    const response: AviationData = {
      metar,
      taf,
      assessment,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Aviation API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch aviation weather data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
