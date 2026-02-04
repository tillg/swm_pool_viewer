import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { RawDataPoint, BucketData, TimeRange } from './types';
import { fetchOccupancyData } from './utils/dataFetcher';
import { aggregateData } from './utils/dataAggregator';
import { createColorMap } from './utils/colors';
import { theme } from './styles/theme';
import { Hero } from './components/Hero';
import { Spinner } from './components/Spinner';
import { TimeRangeToggle } from './components/TimeRangeToggle';
import { WeatherHeader } from './components/WeatherHeader';
import { OccupancyChart } from './components/OccupancyChart';
import { Footer } from './components/Footer';
import { WhenToSwimSection } from './components/WhenToSwimSection';
import { TimeSlotSelection } from './components/WhenToSwimSection/TimeSlotSelector';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.page};
  font-family: ${theme.typography.fontFamily.primary};
`;

const ContentContainer = styled.div`
  max-width: ${theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const IntroText = styled.div`
  margin-bottom: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.body};
  color: ${theme.colors.text.primary};
  line-height: 1.6;

  p {
    margin: 0 0 ${theme.spacing.m} 0;
  }

  a {
    color: ${theme.colors.brand.primary};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const BlueSection = styled.section`
  background: #EFF7FE;
  padding: ${theme.spacing.xl} 0;
`;

const BlueSectionContent = styled.div`
  max-width: ${theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.l} 0;
  font-size: 28px;
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.bold};
  line-height: 1.33;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.m};
  gap: ${theme.spacing.xl};
`;

const ChartSection = styled.div`
  background: ${theme.colors.background.page};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;

  ${theme.mediaQueries.mobile} {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const ChartScrollContainer = styled.div`
  ${theme.mediaQueries.mobile} {
    min-width: 700px;
  }
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.alert.background};
  border: 1px solid ${theme.colors.alert.text};
  border-radius: ${theme.borderRadius.large};
  color: ${theme.colors.alert.text};
  text-align: center;
`;

const ChartFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.s} ${theme.spacing.m};
  font-size: 12px;
  color: ${theme.colors.text.muted};
  border-top: 1px solid ${theme.colors.border};

  ${theme.mediaQueries.mobile} {
    flex-direction: column;
    gap: ${theme.spacing.s};
    align-items: flex-start;
  }
`;

const LineTypeLegend = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.m};
`;

const LineTypeSample = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SolidLine = styled.span`
  display: inline-block;
  width: 20px;
  height: 2px;
  background: ${theme.colors.text.secondary};
`;

const DashedLine = styled.span`
  display: inline-block;
  width: 20px;
  height: 2px;
  background: repeating-linear-gradient(
    to right,
    ${theme.colors.text.secondary} 0px,
    ${theme.colors.text.secondary} 4px,
    transparent 4px,
    transparent 7px
  );
`;

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 400;
const CHART_MARGIN = { top: 20, right: 70, bottom: 40, left: 50 };

const STORAGE_KEY = 'swm-pool-viewer-state';

interface SavedState {
  timeRange?: TimeRange;
  visibility?: Record<string, boolean>;
  swimTimeSelection?: TimeSlotSelection;
}

function loadSavedState(): SavedState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load saved state:', e);
  }
  return {};
}

function App() {
  const savedStateRef = useRef(loadSavedState());
  const [rawData, setRawData] = useState<RawDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(savedStateRef.current.timeRange ?? 'week');
  const [visibility, setVisibility] = useState<Map<string, boolean>>(new Map());
  const [swimTimeSelection, setSwimTimeSelection] = useState<TimeSlotSelection | undefined>(
    savedStateRef.current.swimTimeSelection
  );

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
  const { buckets, facilities, facilityTypes, lastDataTimestamp } = rawData
    ? aggregateData(rawData, timeRange)
    : { buckets: [] as BucketData[], facilities: [] as string[], facilityTypes: new Map<string, string>(), lastDataTimestamp: null as Date | null };

  // Initialize visibility when facilities change, merging with saved state
  useEffect(() => {
    if (facilities.length > 0 && visibility.size === 0) {
      const initialVisibility = new Map<string, boolean>();
      const savedVisibility = savedStateRef.current.visibility ?? {};
      facilities.forEach(f => {
        // Use saved value if exists, otherwise default to visible
        initialVisibility.set(f, savedVisibility[f] ?? true);
      });
      setVisibility(initialVisibility);
    }
  }, [facilities, visibility.size]);

  // Persist state to localStorage
  useEffect(() => {
    if (visibility.size === 0) return; // Don't save until initialized
    const state: SavedState = {
      timeRange,
      visibility: Object.fromEntries(visibility),
      swimTimeSelection,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [timeRange, visibility, swimTimeSelection]);

  const colorMap = createColorMap(facilities);

  const handleToggleVisibility = useCallback((facility: string) => {
    setVisibility(prev => {
      const next = new Map(prev);
      next.set(facility, !prev.get(facility));
      return next;
    });
  }, []);

  const handleToggleGroup = useCallback((facilities: string[], visible: boolean) => {
    setVisibility(prev => {
      const next = new Map(prev);
      facilities.forEach(f => next.set(f, visible));
      return next;
    });
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <Hero />
        <ContentContainer>
          <Spinner />
        </ContentContainer>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Hero />
        <ContentContainer>
          <ErrorMessage>
            Error loading data: {error}
          </ErrorMessage>
        </ContentContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Hero />
      <ContentContainer>
        <IntroText>
          <p>
            Diese Webseite zeigt, wie voll die Münchner Schwimmbäder zu verschiedenen Zeiten sind.
            Die Auslastungsdaten werden regelmäßig von der Webseite der Stadtwerke München (SWM) übernommen und als historische Kurven dargestellt.
          </p>
          <p>
            Dies ist ein <b>privates Projekt</b>, nicht von den Stadtwerken München. Aktuelle Live-Daten findest du direkt auf der <a href="https://www.swm.de/baeder/auslastung" target="_blank" rel="noopener noreferrer">Seite der SWM</a>.
          </p>
        </IntroText>
      </ContentContainer>

      <WhenToSwimSection
        rawData={rawData!}
        facilities={facilities}
        facilityTypes={facilityTypes}
        colorMap={colorMap}
        visibility={visibility}
        onToggle={handleToggleVisibility}
        onToggleGroup={handleToggleGroup}
        swimTimeSelection={swimTimeSelection}
        onSwimTimeChange={setSwimTimeSelection}
      />

      <BlueSection>
        <BlueSectionContent>
          <SectionTitle>Auslastung-Historie</SectionTitle>

          <Header>
            <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          </Header>

          <ChartSection>
            <ChartScrollContainer>
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
            </ChartScrollContainer>
            <ChartFooter>
              <LineTypeLegend>
                <LineTypeSample>
                  <SolidLine />
                  <span>Historisch</span>
                </LineTypeSample>
                <LineTypeSample>
                  <DashedLine />
                  <span>Prognose</span>
                </LineTypeSample>
              </LineTypeLegend>
              {lastDataTimestamp && (
                <span>
                  Letzter Datenpunkt: {lastDataTimestamp.toLocaleString('de-DE', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </ChartFooter>
          </ChartSection>
        </BlueSectionContent>
      </BlueSection>
      <Footer />
    </PageWrapper>
  );
}

export default App;
