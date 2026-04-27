export interface RawDataPoint {
  timestamp: string;
  facility_name: string;
  facility_type: string;
  occupancy_percent: number;
  // 1 = open, 0 = closed, null = unknown (facility missing from opening-hours
  // snapshot). Populated for both historical and forecast rows since the
  // opening-hours overlay landed upstream (2026-04).
  is_open: number | null;
  hour: number;
  day_of_week: number;
  month: number;
  is_weekend: number;
  is_holiday: number;
  is_school_vacation: number;
  temperature_c: number;
  precipitation_mm: number;
  weather_code: number;
  cloud_cover_percent: number;
  data_source: 'historical' | 'forecast';
}

export interface BucketData {
  bucketIndex: number;
  startTime: Date;
  endTime: Date;
  facilities: Map<string, number>; // facility name -> avg occupancy
  avgTemperature: number;
  avgPrecipitation: number;
  weatherCode: number; // most common weather code in bucket
  isForecast: boolean;
}

export type TimeRange = 'week' | '2days';

// Open/close transition for one facility, derived from is_open flips in the
// raw CSV. See Specs/changes/chart-opening-hours-markers/domain.md.
export interface OpeningEvent {
  time: Date;
  type: 'open' | 'close';
  isForecast: boolean;
}
