export interface RawDataPoint {
  timestamp: string;
  pool_name: string;
  facility_type: string;
  occupancy_percent: number;
  is_open: number;
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
}

export interface BucketData {
  bucketIndex: number;
  startTime: Date;
  endTime: Date;
  facilities: Map<string, number>; // facility name -> avg occupancy
  avgTemperature: number;
  avgPrecipitation: number;
  weatherCode: number; // most common weather code in bucket
}

export type TimeRange = 'week' | '2days';
