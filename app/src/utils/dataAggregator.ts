import { RawDataPoint, BucketData, TimeRange } from '../types';

const BUCKET_COUNT = 24;

// Create a unique facility ID from name and type
function getFacilityId(name: string, type: string): string {
  return `${name}|${type}`;
}

// Get display name for a facility - shows type suffix only for non-pool facilities
function getDisplayName(name: string, type: string): string {
  switch (type?.toLowerCase()) {
    case 'sauna':
      return `${name} (Sauna)`;
    case 'ice_rink':
    case 'eislauf':
    case 'eislaufbahn':
      return name; // Ice rinks typically have unique names
    default:
      return name; // Pools keep their original name
  }
}

function getTimeRange(range: TimeRange, forecastData: RawDataPoint[]): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);

  if (range === 'week') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 2);
  }

  // End is the max of now or the latest forecast timestamp
  let end = now;
  if (forecastData.length > 0) {
    const forecastTimestamps = forecastData.map(p => new Date(p.timestamp).getTime());
    const maxForecast = new Date(Math.max(...forecastTimestamps));
    if (maxForecast > end) {
      end = maxForecast;
    }
  }

  return { start, end };
}

function getMostCommonWeatherCode(codes: number[]): number {
  if (codes.length === 0) return 0;

  const counts = new Map<number, number>();
  let maxCount = 0;
  let mostCommon = codes[0];

  for (const code of codes) {
    const count = (counts.get(code) || 0) + 1;
    counts.set(code, count);
    if (count > maxCount) {
      maxCount = count;
      mostCommon = code;
    }
  }

  return mostCommon;
}

export function aggregateData(
  data: RawDataPoint[],
  timeRange: TimeRange
): { buckets: BucketData[]; facilities: string[]; facilityTypes: Map<string, string>; lastDataTimestamp: Date | null } {
  const now = new Date();

  // Separate historical and forecast data
  const historicalData = data.filter(p => p.data_source === 'historical');
  const forecastData = data.filter(p => p.data_source === 'forecast');

  const { start, end } = getTimeRange(timeRange, forecastData);
  const timeSpan = end.getTime() - start.getTime();
  const bucketSize = timeSpan / BUCKET_COUNT;

  // Filter historical data: apply time range and is_open filter
  const filteredHistorical = historicalData.filter(point => {
    const timestamp = new Date(point.timestamp);
    const inRange = timestamp >= start && timestamp <= end;
    const isOpen = point.is_open === 1;
    return inRange && isOpen;
  });

  // Filter forecast data: apply time range only (is_open is NULL for forecast)
  const filteredForecast = forecastData.filter(point => {
    const timestamp = new Date(point.timestamp);
    return timestamp >= start && timestamp <= end;
  });

  const filteredData = [...filteredHistorical, ...filteredForecast];

  // Get unique facilities (using name|type as unique identifier) and map to display names
  const facilityIdToDisplay = new Map<string, string>();
  const facilityTypeMap = new Map<string, string>();
  filteredData.forEach(point => {
    const facilityId = getFacilityId(point.facility_name, point.facility_type);
    if (!facilityIdToDisplay.has(facilityId)) {
      const displayName = getDisplayName(point.facility_name, point.facility_type);
      facilityIdToDisplay.set(facilityId, displayName);
      facilityTypeMap.set(displayName, point.facility_type);
    }
  });
  const facilities = Array.from(facilityIdToDisplay.values()).sort();

  // Initialize buckets
  const buckets: BucketData[] = [];
  for (let i = 0; i < BUCKET_COUNT; i++) {
    const bucketStart = new Date(start.getTime() + i * bucketSize);
    const bucketEnd = new Date(start.getTime() + (i + 1) * bucketSize);
    const bucketMid = new Date((bucketStart.getTime() + bucketEnd.getTime()) / 2);
    buckets.push({
      bucketIndex: i,
      startTime: bucketStart,
      endTime: bucketEnd,
      facilities: new Map(),
      avgTemperature: 0,
      avgPrecipitation: 0,
      weatherCode: 0,
      isForecast: bucketMid > now
    });
  }

  // Group data points by bucket
  const bucketData: Array<{
    occupancies: Map<string, number[]>;
    temperatures: number[];
    precipitations: number[];
    weatherCodes: number[];
  }> = buckets.map(() => ({
    occupancies: new Map(),
    temperatures: [],
    precipitations: [],
    weatherCodes: []
  }));

  for (const point of filteredData) {
    const timestamp = new Date(point.timestamp);
    const bucketIndex = Math.min(
      Math.floor((timestamp.getTime() - start.getTime()) / bucketSize),
      BUCKET_COUNT - 1
    );

    if (bucketIndex >= 0 && bucketIndex < BUCKET_COUNT) {
      const bucket = bucketData[bucketIndex];

      // Occupancy per facility - use display name as key
      // Invert the value: data shows "available capacity", we want "occupancy"
      const occupancy = 100 - point.occupancy_percent;
      const facilityId = getFacilityId(point.facility_name, point.facility_type);
      const displayName = facilityIdToDisplay.get(facilityId)!;
      if (!bucket.occupancies.has(displayName)) {
        bucket.occupancies.set(displayName, []);
      }
      bucket.occupancies.get(displayName)!.push(occupancy);

      // Weather data
      if (point.temperature_c != null) {
        bucket.temperatures.push(point.temperature_c);
      }
      if (point.precipitation_mm != null) {
        bucket.precipitations.push(point.precipitation_mm);
      }
      if (point.weather_code != null) {
        bucket.weatherCodes.push(point.weather_code);
      }
    }
  }

  // Calculate averages for each bucket
  for (let i = 0; i < BUCKET_COUNT; i++) {
    const raw = bucketData[i];
    const bucket = buckets[i];

    // Average occupancy per facility
    for (const [facility, values] of raw.occupancies) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      bucket.facilities.set(facility, avg);
    }

    // Average weather
    if (raw.temperatures.length > 0) {
      bucket.avgTemperature = raw.temperatures.reduce((a, b) => a + b, 0) / raw.temperatures.length;
    }
    if (raw.precipitations.length > 0) {
      bucket.avgPrecipitation = raw.precipitations.reduce((a, b) => a + b, 0) / raw.precipitations.length;
    }
    bucket.weatherCode = getMostCommonWeatherCode(raw.weatherCodes);
  }

  // Calculate the last data timestamp (historical only)
  let lastDataTimestamp: Date | null = null;
  if (filteredHistorical.length > 0) {
    const timestamps = filteredHistorical.map(p => new Date(p.timestamp).getTime());
    lastDataTimestamp = new Date(Math.max(...timestamps));
  }

  return { buckets, facilities, facilityTypes: facilityTypeMap, lastDataTimestamp };
}
