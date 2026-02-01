# Adapt to CSV Format

## Context

The data CSV file was reformatted and renamed from `occupancy_features.csv` to `occupancy_historical.csv`.

- **Old URL:** `.../datasets/occupancy_features.csv`
- **New URL:** `.../datasets/occupancy_historical.csv`

## Format Changes

| Aspect | Old | New |
| ------ | --- | --- |
| Column name | `pool_name` | `facility_name` |
| Data source | (none) | `data_source` column added (can be ignored) |

All other columns remain identical. The `occupancy_percent` field continues to represent actual occupancy (no change in semantics).

## Implementation

1. **dataFetcher.ts** – Update `DATA_URL` to the new path
2. **types.ts** – Rename `pool_name` → `facility_name` in `RawDataPoint`
3. **dataAggregator.ts** – Update property reference from `pool_name` to `facility_name`

No logic changes needed. The existing occupancy inversion (`100 - occupancy_percent`) remains correct.
