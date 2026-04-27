import { RawDataPoint, BucketData, TimeRange, OpeningEvent } from '../types';

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

// Derive open/close events from the pre-is_open-filter row stream.
// See Specs/changes/chart-opening-hours-markers/{domain.md,architecture.md}.
function deriveOpeningEvents(
  rows: RawDataPoint[],
  maxHistoricalTime: number,
  facilityIdToDisplay: Map<string, string>
): Map<string, OpeningEvent[]> {
  const byFacility = new Map<string, RawDataPoint[]>();
  for (const point of rows) {
    const id = getFacilityId(point.facility_name, point.facility_type);
    let group = byFacility.get(id);
    if (!group) {
      group = [];
      byFacility.set(id, group);
    }
    group.push(point);
  }

  const result = new Map<string, OpeningEvent[]>();

  for (const [id, group] of byFacility) {
    const displayName = facilityIdToDisplay.get(id);
    if (!displayName) continue;

    group.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const events: OpeningEvent[] = [];
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const curr = group[i];
      // null is treated as "unknown / assume open" — never triggers a flip.
      if (prev.is_open === 0 && curr.is_open === 1) {
        const t = new Date(curr.timestamp);
        events.push({
          time: t,
          type: 'open',
          isForecast: t.getTime() > maxHistoricalTime,
        });
      } else if (prev.is_open === 1 && curr.is_open === 0) {
        // close event lands on the last open hour, not the first closed one.
        const t = new Date(prev.timestamp);
        events.push({
          time: t,
          type: 'close',
          isForecast: t.getTime() > maxHistoricalTime,
        });
      }
    }

    if (events.length > 0) {
      result.set(displayName, events);
    }
  }

  return result;
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
): {
  buckets: BucketData[];
  facilities: string[];
  facilityTypes: Map<string, string>;
  lastDataTimestamp: Date | null;
  openingEvents: Map<string, OpeningEvent[]>;
} {
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

  // Anchor the forecast boundary at the most recent live scrape so the
  // dashed segment begins right after "Jetzt" and doesn't swallow the
  // bucket we already have 15-min historical data for.
  const maxHistoricalTime = filteredHistorical.length > 0
    ? Math.max(...filteredHistorical.map(p => new Date(p.timestamp).getTime()))
    : 0;

  // Filter forecast data: apply time range, drop scheduled-closed rows
  // (is_open=0 sentinel from the opening-hours overlay), and drop any
  // point already covered by a live historical scrape. is_open === null
  // (facility missing from snapshot) still passes through.
  const filteredForecast = forecastData.filter(point => {
    const timestamp = new Date(point.timestamp).getTime();
    const inRange = timestamp >= start.getTime() && timestamp <= end.getTime();
    const notClosed = point.is_open !== 0;
    const afterHistorical = timestamp > maxHistoricalTime;
    return inRange && notClosed && afterHistorical;
  });

  // Deduplicate: for each (facility, timestamp) pair, historical takes precedence over forecast
  const dataPointMap = new Map<string, RawDataPoint>();

  // Add forecast first, then historical overwrites
  for (const point of filteredForecast) {
    const key = `${getFacilityId(point.facility_name, point.facility_type)}|${point.timestamp}`;
    dataPointMap.set(key, point);
  }
  for (const point of filteredHistorical) {
    const key = `${getFacilityId(point.facility_name, point.facility_type)}|${point.timestamp}`;
    dataPointMap.set(key, point);  // Overwrites forecast if exists
  }

  const filteredData = Array.from(dataPointMap.values());

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

  // Build event-detection input: in-window rows with no is_open filter
  // (we need the 0s to detect close transitions), but re-apply Spec 15's
  // overlap rule — drop forecast rows already covered by a live scrape and
  // let historical win on (facility, timestamp) collisions. See
  // architecture.md D6.
  const eventInputMap = new Map<string, RawDataPoint>();
  for (const point of data) {
    if (point.data_source !== 'forecast') continue;
    const t = new Date(point.timestamp).getTime();
    if (t < start.getTime() || t > end.getTime()) continue;
    if (t <= maxHistoricalTime) continue;
    const key = `${getFacilityId(point.facility_name, point.facility_type)}|${point.timestamp}`;
    eventInputMap.set(key, point);
  }
  for (const point of data) {
    if (point.data_source !== 'historical') continue;
    const t = new Date(point.timestamp).getTime();
    if (t < start.getTime() || t > end.getTime()) continue;
    const key = `${getFacilityId(point.facility_name, point.facility_type)}|${point.timestamp}`;
    eventInputMap.set(key, point);
  }
  const openingEvents = deriveOpeningEvents(
    Array.from(eventInputMap.values()),
    maxHistoricalTime,
    facilityIdToDisplay
  );

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
      weatherCode: 0,
      isForecast: false  // Will be set based on actual data content
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

    // A bucket that starts before the most recent live scrape is drawn as
    // historical even if a few forecast hours land in its tail. Without
    // this, a wide weekly bucket straddling "Jetzt" would flip the whole
    // region to dashed because ~3 forecast hours outvote ~20 live scrapes
    // in hasForecast's OR logic.
    bucket.isForecast = bucket.startTime.getTime() > maxHistoricalTime;

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

  return { buckets, facilities, facilityTypes: facilityTypeMap, lastDataTimestamp, openingEvents };
}
