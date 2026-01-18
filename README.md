# SWM Pool Viewer

View time series occupancy data for Munich's SWM pools and saunas.

Data source: [SWM Pool Data](https://github.com/tillg/swm_pool_data)

## Features

- Line chart showing occupancy % over time for all facilities
- Toggle between "Last week" and "Last 2 days" time ranges
- Weather information (temperature, precipitation, icons) displayed per time bucket
- Legend with toggleable visibility per pool/sauna
- Data aggregated into 24 buckets across the selected time range

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd app
npm install
```

### Running the App

```bash
cd app
npm start
```

The app will start on [http://localhost:1234](http://localhost:1234).

### Building for Production

```bash
cd app
npm run build
```

Build output will be in the `app/dist` directory.

## Tech Stack

- React 18
- TypeScript
- styled-components
- D3.js for charting
- Parcel bundler
