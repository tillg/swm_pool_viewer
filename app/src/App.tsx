import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { RawDataPoint, BucketData, TimeRange } from './types';
import { fetchOccupancyData } from './utils/dataFetcher';
import { aggregateData } from './utils/dataAggregator';
import { createColorMap } from './utils/colors';
import { Spinner } from './components/Spinner';
import { TimeRangeToggle } from './components/TimeRangeToggle';
import { Legend } from './components/Legend';
import { WeatherHeader } from './components/WeatherHeader';
import { OccupancyChart } from './components/OccupancyChart';

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  margin: 0 0 24px 0;
  font-size: 24px;
  color: #333;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 24px;
`;

const MainContent = styled.div`
  display: flex;
  gap: 24px;
`;

const ChartSection = styled.div`
  flex: 1;
  min-width: 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const LegendSection = styled.div`
  width: 220px;
  flex-shrink: 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
`;

const LegendTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  padding: 24px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c00;
  text-align: center;
`;

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 400;
const CHART_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

function App() {
  const [rawData, setRawData] = useState<RawDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [visibility, setVisibility] = useState<Map<string, boolean>>(new Map());

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOccupancyData();
        setRawData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data';
        setError(message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aggregate data based on time range
  const { buckets, facilities } = rawData
    ? aggregateData(rawData, timeRange)
    : { buckets: [] as BucketData[], facilities: [] as string[] };

  // Initialize visibility when facilities change
  useEffect(() => {
    if (facilities.length > 0 && visibility.size === 0) {
      const initialVisibility = new Map<string, boolean>();
      facilities.forEach(f => initialVisibility.set(f, true));
      setVisibility(initialVisibility);
    }
  }, [facilities, visibility.size]);

  const colorMap = createColorMap(facilities);

  const handleToggleVisibility = useCallback((facility: string) => {
    setVisibility(prev => {
      const next = new Map(prev);
      next.set(facility, !prev.get(facility));
      return next;
    });
  }, []);

  if (loading) {
    return (
      <AppContainer>
        <Title>SWM Pool & Sauna Occupancy</Title>
        <Spinner />
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <Title>SWM Pool & Sauna Occupancy</Title>
        <ErrorMessage>
          Error loading data: {error}
        </ErrorMessage>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Title>SWM Pool & Sauna Occupancy</Title>

      <Header>
        <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
      </Header>

      <MainContent>
        <ChartSection>
          <WeatherHeader
            buckets={buckets}
            leftMargin={CHART_MARGIN.left}
            rightMargin={CHART_MARGIN.right}
          />
          <OccupancyChart
            buckets={buckets}
            facilities={facilities}
            colorMap={colorMap}
            visibility={visibility}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            margin={CHART_MARGIN}
          />
        </ChartSection>

        <LegendSection>
          <LegendTitle>Facilities</LegendTitle>
          <Legend
            facilities={facilities}
            colorMap={colorMap}
            visibility={visibility}
            onToggle={handleToggleVisibility}
          />
        </LegendSection>
      </MainContent>
    </AppContainer>
  );
}

export default App;
