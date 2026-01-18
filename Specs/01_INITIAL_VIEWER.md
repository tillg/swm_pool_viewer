# Initial Viewer

View time series occupancy data for Munich's SWM pools and saunas.

## Requirements

* React app with styled-components and Webpack bundler
* Data source: [occupancy_features.csv](https://raw.githubusercontent.com/tillg/swm_pool_data/refs/heads/main/datasets/occupancy_features.csv)
* Time range toggle: "Last week" / "Last 2 days"
* Line chart showing occupancy % over time, one line per facility
* Legend with toggleable visibility per pool/sauna
* Weather info displayed per time bucket (icon, temp °C, precipitation mm)
* Desktop-first (mobile responsiveness is not a priority)

---

## Architecture

### Tech Stack

* React 18 + TypeScript
* styled-components for styling
* D3.js for charting (direct usage, no wrapper)
* Webpack bundler
* papaparse for CSV parsing

### Data Flow

```text
CSV (GitHub) → fetch on page load → parse → filter open facilities → invert values → aggregate into 24 buckets → render
```

* **Fetch strategy:** Fresh fetch on every page load (no caching)
* **Filtering:** Only include data points where `is_open = 1`
* **Value inversion:** The CSV's `occupancy_percent` represents available capacity, so we display `100 - occupancy_percent` as actual occupancy
* **Aggregation:** 24 total buckets across the selected time range, values averaged per bucket

---

## UI Layout

```text
┌─────────────────────────────────────────────────────────┐
│  [Last week]  [Last 2 days]                             │
├───────────────────────────────────────────┬─────────────┤
│  ☀️ 5°  ⛅ 3°  🌧️ 2°  ...  (weather row)  │ Facilities  │
├───────────────────────────────────────────┤ ☑ Pool A    │
│                                           │ ☑ Pool B    │
│  ~~~~ D3 Line chart ~~~~                  │ ☑ Sauna A   │
│  Y-axis: 0-100% occupancy                 │   ...       │
│  X-axis: time                             │             │
└───────────────────────────────────────────┴─────────────┘
```

* **Weather row:** Icons, temperature, precipitation per bucket
* **Legend:** Checkboxes to toggle facility visibility (all visible by default)
* **Loading state:** Spinner while CSV is fetched
* **Error state:** Error message if fetch fails

### Colors

13-color palette with distinct hues per facility for visual differentiation.

### Weather Icons

WMO weather codes mapped to emoji: ☀️ (clear), ⛅ (cloudy), 🌧️ (rain), 🌨️ (snow), ⛈️ (thunderstorm), 🌫️ (fog).

---

## Data Notes

The CSV `occupancy_percent` column represents **available capacity**, not occupancy. The app inverts this value to show actual occupancy (busier = higher percentage).

Data points with `is_open = 0` are filtered out.

---

## Open for Future

* Mobile layout
* Additional time ranges
* Hover tooltips with exact values
