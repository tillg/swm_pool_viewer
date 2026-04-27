# Implementation Plan — Chart Opening-Hours Markers

Read `proposal.md` and `architecture.md` first. Steps are ordered;
each step is intended to be one focused commit.

## 1. Type contract

- [x] In `app/src/types.ts`, add the `OpeningEvent` interface
      (`{ time: Date; type: 'open' | 'close'; isForecast: boolean }`).
- [x] Document `OpeningEvent` with a one-line comment that points to
      `Specs/changes/chart-opening-hours-markers/domain.md`.

**Verify:** `npm run build` (or `tsc --noEmit`) succeeds — no
consumers yet, so this is a structural-only change.

## 2. Event derivation in the aggregator

- [x] In `app/src/utils/dataAggregator.ts`, add a pure helper
      `deriveOpeningEvents(rows, maxHistoricalTime, displayNameFor)`
      that returns `Map<displayName, OpeningEvent[]>`.
- [x] The helper:
  - **applies Spec 15's overlap rule** (architecture D6) on its
    input: drop forecast rows where `timestamp <= maxHistoricalTime`,
    and dedup any remaining `(facility, timestamp)` collision with
    historical winning. **Do not** apply the `is_open` filter — we
    need the `0`s,
  - groups the deduped rows by `(facility_name, facility_type)`,
  - sorts each group by timestamp ascending,
  - walks adjacent pairs and emits `open` / `close` events per the
    rules in `domain.md` (`null` does **not** trigger a flip; no
    edge events at window boundaries),
  - tags each event with `isForecast = event.time.getTime() > maxHistoricalTime`,
  - keys results by **display name** (so `OccupancyChart` can look
    up by the same key it uses for line color / visibility).
- [x] Compute `openingEvents` inside `aggregateData` after
      `maxHistoricalTime` is known (it's needed both for the dedup
      and for the `isForecast` tag) but before the bucket loop. Pass
      the same `maxHistoricalTime` value the bucketing path uses —
      one source of truth.
- [ ] Extend `aggregateData`'s return type to include
      `openingEvents`.

**Verify:** `npm run build`. Drop a `console.log(openingEvents)` in
`App.tsx` once, refresh `localhost:3000`, confirm the map contains
events for typical facilities (e.g. `Bad Giesing-Harlaching` ~08:00
open + ~21:00 close), then remove the log.

## 3. Wire through to the chart

- [x] In `app/src/App.tsx`, destructure `openingEvents` from
      `aggregateData`'s return and pass it to `<OccupancyChart>`.
- [x] In `app/src/components/OccupancyChart.tsx`, add
      `openingEvents: Map<string, OpeningEvent[]>` to
      `OccupancyChartProps`.
- [x] Add `openingEvents` to the `useEffect` dependency array.

**Verify:** `npm run build`. App still renders identically (no
visual change yet — the events are unused).

## 4. Splice synthetic anchors at events

- [x] Inside the per-facility loop in `OccupancyChart.tsx`, after
      the existing `historicalData` / `forecastData` split and the
      existing "splice at Jetzt" block, add an event-splice block:
  - For each event of the facility:
    - choose target segment via `event.isForecast` (no need to
      re-derive `maxHistoricalTime` in the chart),
    - compute an interpolated value (per architecture D5: nearest
      neighbour within that segment; open prefers following, close
      prefers preceding),
    - insert `{ time: event.time, value: interpolatedValue,
      isForecast: event.isForecast }` into the segment, keeping the
      array sorted by time.
- [x] Critical invariant: an `open` anchor must be the *first* point
      of a new open run; a `close` anchor must be the *last* point
      of the current open run. Enforced by inserting a `NaN` sentinel
      right after each close anchor (line generator's `defined()` gates
      on `!isNaN(value)`, so the sentinel breaks the path). Bucket
      midpoints that would land inside a closed period are also
      filtered upstream of the splice.
- [x] Note: kept `maxHistoricalTime` local to `dataAggregator.ts`;
      events carry `isForecast` so the chart doesn't need it
      separately.

**Verify:** open the app; confirm each facility's line now starts
and ends *exactly* at the event timestamps (visible as the line
hitting clean hour boundaries instead of bucket midpoints).

## 5. Render dots

- [x] After the line `path` appends in the per-facility loop, append
      an SVG `circle` per spliced anchor (`dotPositions`).
- [x] Skip dots when the facility is hidden via `visibility`
      (already gated by the early `return` at the top of the loop).
- [x] Dots are appended last in the loop body, so they sit on top of
      the line ink.

**Verify:** open the app and visually check each visible facility:
opening dots at ~08:00 (or whatever the schedule says), closing dots
at ~21:00, line ending under each dot.

## 6. Visual sanity & screenshots

- [x] Confirm `.tmp/` is in `.gitignore` (project rule from
      `CLAUDE.md`); if missing, add it.
- [x] With `npm start` running, drive a Playwright capture of:
  - the chart in default state (`week` range),
  - the chart in `2days` range,
  - one screenshot with a facility toggled off.
- [x] Save to `.tmp/chart-opening-hours-markers-*.png`.
- [x] Verify each screenshot meets the four success criteria from
      `proposal.md`.

## 7. Edge-case sweep

- [x] **Window starts mid-open run**: no leading "open" dot at the
      window edge.
- [x] **Window ends mid-open run**: no trailing "close" dot at the
      window edge.
- [x] **Facility absent from opening-hours snapshot**: ice rink
      (`closed_for_season`) shows neither line nor dots.
- [x] **Forecast horizon ends inside an open period**: rightmost
      forecast segment ends at a bucket midpoint, no orphan dot at
      the chart edge.
- [x] **Spec 15 regression check**: no 100 % spike anywhere; max
      occupancy tops out at the genuine ~75 %.
- [x] **Overlap-region phantom event**: D6 dedup holds — no extra
      dot at the live-scrape boundary; events appear exactly at
      schedule transitions.
- [ ] **Same facility opens twice in one day** (the JSON schema
      allows multiple `[{open, close}]` entries per weekday): not
      observed in the current snapshot. Forward-looking; revisit
      if a facility starts using split schedules.

## 8. Final pass and commit

- [x] Re-read `OccupancyChart.tsx` end-to-end; no experimental
      code, console logs, or commented-out lines.
- [x] `npm run build` clean (exit 0; only pre-existing bundle-size
      warnings).
- [x] Manual run-through of the four success criteria from
      `proposal.md` — all pass.
- [ ] Commit message references this spec folder. Per project rule
      in `CLAUDE.md`, commit the `Specs/changes/chart-opening-hours-markers/`
      artifacts together with the code change in **one** commit.
      *(Awaiting user signal to commit.)*
