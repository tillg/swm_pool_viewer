# Opening-Hours-Aware Viewer

## Context

The upstream `swm_pool_data` pipeline now applies a deterministic
opening-hours overlay at forecast emit time (see
[`Specs/changes/integrate-opening-hours/`](https://github.com/tillg/swm_pool_data/tree/main/Specs/changes/integrate-opening-hours)).
As a result, `occupancy_forecast.csv` rows can carry:

| `is_open` | `occupancy_percent` | Meaning |
|-----------|---------------------|---------|
| `1` | model prediction | Facility scheduled open, predicted free-capacity value. |
| `0` | `0.0` | Facility scheduled closed — sentinel, **not** "100 % full". |
| `NULL` | model prediction | Facility missing from the opening-hours snapshot; keep the raw prediction. |

This supersedes the note in
[`12_SHOW_FORECAST.md`](./12_SHOW_FORECAST.md) that `is_open` is always
NULL in forecast data.

## Problem

The viewer was built on the old assumption. As of 2026-04-22 the forecast
CSV started carrying `is_open = 0` with `occupancy_percent = 0` on closed
hours. The viewer's occupancy inversion `100 - occupancy_percent` turns
that sentinel into `100 %`, so:

- **Chart (`OccupancyChart.tsx`)**: closed forecast hours appear as
  straight lines at 100 % Auslastung. Visible today as a large spike to
  100 % on the last forecast night (the rightmost bucket is almost
  entirely closed hours, so averaging doesn't dilute it).
- **WhenToSwim table (`OccupancyTable.tsx:125`)**: the existing "geschl."
  rendering is gated on `data_source === 'historical'`, so forecast
  closed cells render as `0 %` occupancy instead of "geschl."

## Goal

Make the viewer treat forecast `is_open === 0` the same way it already
treats historical `is_open === 0`. Out of scope: surfacing the weekly
schedule itself (no new "Öffnungszeiten" panel).

## Files to Modify

- **`app/src/utils/dataAggregator.ts`** — Extend the existing forecast
  filter to also drop rows where `is_open === 0`, mirroring the
  historical filter. Points with `is_open === null` continue to pass
  through (unknown-facility fallback). After the filter runs, each
  remaining forecast row has a real model prediction — the inversion is
  correct and the chart shows a gap over closed hours instead of a
  spike.

- **`app/src/components/WhenToSwimSection/OccupancyTable.tsx`** — Change
  the `isClosed` derivation so forecast rows count too:

  ```ts
  // before
  const isClosed = point.data_source === 'historical' && point.is_open === 0;
  // after
  const isClosed = point.is_open === 0;
  ```

  Hours where the only available reading is a closed forecast will now
  correctly display "geschl." rather than `0 %`.

- **`app/src/types.ts`** — No schema change needed (`is_open` is already
  `number | null`). Add or refresh the inline comment on `is_open` to
  reflect the three-state contract.

## Behavior After Change

### Chart

- Closed forecast hours contribute **no** data point. D3's
  `line.defined()` handles gaps natively — the dashed line breaks over
  closed hours instead of spiking.
- Buckets that straddle the open/close boundary now average only over
  open hours inside the bucket, which is the intended behavior.
- No change to historical rendering.

### WhenToSwim table

- Forecast cell where `is_open === 0` → "geschl." (greyed out, same as
  today's historical behavior).
- Forecast cell where `is_open === 1` → gauge + model prediction.
- Forecast cell where `is_open === null` (facility missing from
  snapshot) → gauge + prediction, same as pre-overlay behavior.
- Historical takes precedence over forecast for a given hour (existing
  rule, unchanged).

## Chart Historical/Forecast Boundary

Even with closed-hour forecast rows filtered out, a secondary issue
appears on the chart: the dashed segment starts noticeably earlier
than `Jetzt` instead of right next to it.

Root cause: the aggregator creates ~4-hour buckets, and each bucket is
drawn dashed as soon as **any** forecast point lands in it
(`bucket.hasForecast = true` on any forecast hit). Since the daily
forecast is regenerated at 05:00 UTC = ~07:00 Berlin, today's forecast
includes hourly points from 07:00 onward. The bucket containing `Jetzt`
also contains those early forecast hours, so the entire bucket flips
to dashed — even though it's mostly made of 15-minute historical
scrapes.

### Fix

Two changes in `dataAggregator.ts`:

1. **Drop forecast points whose timestamp is `<= max(historical.timestamp)`.**
   Removes stale model predictions from the overlap region so they
   can't pollute bucket averages.

2. **Classify a bucket as forecast by its start time, not by its
   contents.** A wide weekly bucket straddling `Jetzt` contains mostly
   live 15-min scrapes plus a handful of future forecast hours. The
   previous OR-based `hasForecast` flag let those few forecast points
   flip the whole bucket to dashed. Switching to
   `bucket.startTime > maxHistoricalTime` ties the boundary to actual
   chronology.

```ts
// dataAggregator.ts
const maxHistoricalTime = filteredHistorical.length > 0
  ? Math.max(...filteredHistorical.map(p => new Date(p.timestamp).getTime()))
  : 0;

const filteredForecast = forecastData.filter(point => {
  const t = new Date(point.timestamp).getTime();
  const inRange = t >= start.getTime() && t <= end.getTime();
  const notClosed = point.is_open !== 0;
  const afterHistorical = t > maxHistoricalTime;
  return inRange && notClosed && afterHistorical;
});

// ...

bucket.isForecast = bucket.startTime.getTime() > maxHistoricalTime;
```

Result: the dashed segment begins at the first bucket whose start time
is strictly after the most recent live scrape — never earlier than
`Jetzt`, regardless of bucket width.

### Splice exactly at Jetzt

Bucket classification still leaves the visible solid→dashed transition
at a bucket midpoint, which can be several hours off from the `Jetzt`
line — visible as a solid curve that runs past `Jetzt` before turning
dashed. Fix it as a pure render concern in `OccupancyChart.tsx`: for
each facility, if `now` falls between the last historical midpoint and
the first forecast midpoint, insert a synthetic linearly-interpolated
point at `now` and use it as both the last solid anchor and the first
dashed anchor. The transition lands exactly on the `Jetzt` line.

## Non-Goals

- No new UI surface for displaying the weekly opening-hours schedule.
- No change to historical data handling.
- No change to the chart's 24-bucket aggregation scheme.
- No mixed-bucket gap heuristic (e.g. "if more than half closed, drop
  bucket"). Filtering at the point level before aggregation is enough.

## Testing

Manual:

1. `cd app && npm start`, open <http://localhost:3000>.
2. Confirm the chart no longer shows the 100 % spike at the end of the
   forecast horizon.
3. In WhenToSwim, pick "Morgen" / "früh morgens" for a pool and confirm
   pre-opening hours read "geschl." rather than `0 %`.
4. Save a before/after screenshot pair to `.tmp/`.

Automated: none — the viewer has no unit tests today. Keep any follow-up
test introduction out of scope for this change.
