# Show Forecast

## Goal

Display forecast data alongside historical data, with forecast portions shown as dashed lines and a vertical "now" marker.

## Data Sources

| File | URL |
| ---- | --- |
| `occupancy_historical.csv` | `https://raw.githubusercontent.com/tillg/swm_pool_data/refs/heads/main/datasets/occupancy_historical.csv` |
| `occupancy_forecast.csv` | `https://raw.githubusercontent.com/tillg/swm_pool_data/refs/heads/main/datasets/occupancy_forecast.csv` |

Both files share identical schema. The `data_source` column distinguishes records: `"historical"` vs `"forecast"`. Note: `is_open` is NULL in forecast data and should not be filtered.

## Architecture

1. Fetch both CSVs in parallel
2. Concatenate into single `RawDataPoint[]` array
3. Aggregator tracks `data_source` when building buckets
4. Chart renders forecast segments with dashed stroke

### Files to Modify

- **dataFetcher.ts**: Fetch both CSVs, concatenate results
- **types.ts**: Add `data_source: string` to `RawDataPoint`; add `isForecast: boolean` to `BucketData`
- **dataAggregator.ts**: Track forecast vs historical when aggregating; skip `is_open` filter for forecast data
- **OccupancyChart.tsx**: Render dashed lines for forecast, add "now" marker

## UI Behavior

### Time Range

The existing time range (week/2days) applies to historical data. All available forecast data is always included automatically.

### Visual Design

- **Historical lines**: Solid stroke
- **Forecast lines**: Dashed stroke (`stroke-dasharray="6,4"`)
- **"Now" marker**: Vertical line at current time (red, 2px, labeled "Jetzt")
- **Boundary**: Connected line segments where historical meets forecast
- **Missing forecasts**: Line simply ends if no forecast data exists for a facility

### Legend

Add indicator showing solid = historical, dashed = forecast.

### Tooltips

Tooltips should indicate whether the data point is historical or forecast.
