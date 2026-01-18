import { RawDataPoint, BucketData, TimeRange } from '../types';

const BUCKET_COUNT = 24;

function getTimeRange(range: TimeRange): { start: Date; end: Date } {
  const now = new Date();
  const end = now;
  const start = new Date(now);

  if (range === 'week') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 2);
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
): { buckets: BucketData[]; facilities: string[] } {
  const { start, end } = getTimeRange(timeRange);
  const timeSpan = end.getTime() - start.getTime();
  const bucketSize = timeSpan / BUCKET_COUNT;

  // Filter data to time range and only include open facilities
  const filteredData = data.filter(point => {
    const timestamp = new Date(point.timestamp);
    const inRange = timestamp >= start && timestamp <= end;
    const isOpen = point.is_open === 1;
    return inRange && isOpen;
  });

  // Get unique facilities
  const facilitiesSet = new Set<string>();
  filteredData.forEach(point => facilitiesSet.add(point.pool_name));
  const facilities = Array.from(facilitiesSet).sort();

  // Initialize buckets
  const buckets: BucketData[] = [];
  for (let i = 0; i < BUCKET_COUNT; i++) {
    const bucketStart = new Date(start.getTime() + i * bucketSize);
    const bucketEnd = new Date(start.getTime() + (i + 1) * bucketSize);
    buckets.push({
      bucketIndex: i,
      startTime: bucketStart,
      endTime: bucketEnd,
      facilities: new Map(),
      avgTemperature: 0,
      avgPrecipitation: 0,
      weatherCode: 0
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

      // Occupancy per facility
      // Invert the value: data shows "available capacity", we want "occupancy"
      const occupancy = 100 - point.occupancy_percent;
      if (!bucket.occupancies.has(point.pool_name)) {
        bucket.occupancies.set(point.pool_name, []);
      }
      bucket.occupancies.get(point.pool_name)!.push(occupancy);

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

  return { buckets, facilities };
}
