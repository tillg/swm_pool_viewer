# Initial Viewer

View time series occupancy data for Munich's SWM pools and saunas.

## Requirements

* React app with styled-components
* Data source: [occupancy_features.csv](https://raw.githubusercontent.com/tillg/swm_pool_data/refs/heads/main/datasets/occupancy_features.csv)
* Time range toggle: "Last week" / "Last 2 days"
* Line chart showing occupancy % over time, one line per facility
* Legend with toggleable visibility per pool/sauna
* Weather info displayed per time bucket (icon, temp °C, precipitation mm)
* Desktop-first (mobile responsiveness is not a priority)

---

## Architecture

### Charting: D3 Directly

Using D3 directly (rather than a React wrapper like Recharts) is a solid choice here because:

* **Full control** over the custom swimlane layout with weather header
* **No abstraction overhead** — wrappers like Recharts add convenience but limit flexibility
* **Well-documented** — D3 has extensive docs and examples
* **One dependency** — no need to align React lifecycle with a charting library's opinions

Trade-off: More manual code for bindings and updates, but for a single custom visualization this is manageable.

### Data Flow

```text
CSV (GitHub) → fetch on page load → parse → aggregate into buckets → render chart
```

* **Fetch strategy:** Fresh fetch on every page load (no caching)
* **Aggregation:** 24 total buckets across the selected time range. Data points within each bucket are averaged.

---

## UI Layout

```text
┌─────────────────────────────────────────────────────────┐
│  [Last week]  [Last 2 days]            Legend: ● Pool A │
│                                                 ● Pool B│
├─────────────────────────────────────────────────────────┤
│  ☀️    ⛅    🌧️    ☀️    ...   (weather icons)          │
│  5°    3°    2°    6°    ...   (temperature)            │
│  0mm   2mm   5mm   0mm   ...   (precipitation)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ~~~~ Line chart area ~~~~                              │
│  Y-axis: 0-100% occupancy                               │
│  X-axis: time buckets                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

* **Weather row** above chart shows aggregated weather per bucket
* **Legend** with checkboxes to toggle individual facilities on/off (all visible by default)
* **Chart** is a single continuous line chart (not mini-charts per day)
* **Loading state:** Simple spinner displayed while CSV is being fetched

### Colors

Each facility gets a distinct color to maximize visual differentiation. Use a perceptually uniform color palette (e.g., D3's `schemeTableau10` extended with additional hues) to ensure ~13 lines remain distinguishable.

### Weather Icons

Use a typical sun/cloud/rain icon set mapped from WMO weather codes:

| WMO Code Range | Icon | Description |
|----------------|------|-------------|
| 0 | ☀️ | Clear sky |
| 1-3 | ⛅ | Partly cloudy |
| 45-48 | 🌫️ | Fog |
| 51-57 | 🌧️ | Drizzle |
| 61-67 | 🌧️ | Rain |
| 71-77 | 🌨️ | Snow |
| 80-82 | 🌧️ | Rain showers |
| 95-99 | ⛈️ | Thunderstorm |

---

## Data Details

The CSV contains ~10-minute interval readings with these relevant columns:

| Column | Usage |
| ------ | ----- |
| `timestamp` | X-axis, bucket assignment |
| `pool_name` | One line per unique value |
| `occupancy_percent` | Y-axis value |
| `temperature_c` | Weather header |
| `precipitation_mm` | Weather header |
| `weather_code` | Map to icon (WMO codes) |

Facilities (~13 total): pools and saunas, distinguished by `facility_type`.

---

## Error Handling

* If CSV fetch fails: show clear error message in UI and log to console
* No offline/cached fallback

---

## Open for Future

* Mobile layout
* Additional time ranges
* Hover tooltips with exact values
