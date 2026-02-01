import Papa from 'papaparse';
import { RawDataPoint } from '../types';

const HISTORICAL_URL = 'https://raw.githubusercontent.com/tillg/swm_pool_data/refs/heads/main/datasets/occupancy_historical.csv';
const FORECAST_URL = 'https://raw.githubusercontent.com/tillg/swm_pool_data/refs/heads/main/datasets/occupancy_forecast.csv';

async function fetchCsv(url: string): Promise<RawDataPoint[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<RawDataPoint>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

export async function fetchOccupancyData(): Promise<RawDataPoint[]> {
  const [historical, forecast] = await Promise.all([
    fetchCsv(HISTORICAL_URL),
    fetchCsv(FORECAST_URL)
  ]);

  return [...historical, ...forecast];
}
