import styled from 'styled-components';
import { BucketData } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { theme } from '../styles/theme';

const WeatherContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background.light};
  padding: ${theme.spacing.s} 0;
`;

const WeatherRow = styled.div`
  display: flex;
  flex: 1;
`;

const WeatherCell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
`;

const WeatherIcon = styled.span`
  font-size: ${theme.typography.fontSize.body};
`;

const WeatherValue = styled.span`
  font-size: 11px;
  color: ${theme.colors.text.secondary};
  white-space: nowrap;
`;

const AxisLabels = styled.div<{ $width: number }>`
  width: ${props => props.$width}px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding-right: ${theme.spacing.s};
`;

const AxisLabel = styled.span`
  font-size: 11px;
  color: ${theme.colors.text.muted};
  line-height: 16px;
`;

const AxisSpacer = styled.div<{ $width: number }>`
  width: ${props => props.$width}px;
  flex-shrink: 0;
`;

interface WeatherHeaderProps {
  buckets: BucketData[];
  leftMargin: number;
  rightMargin: number;
}

function formatPrecipitation(value: number): string {
  if (value === 0 || value < 0.05) {
    return '-';
  }
  return value.toFixed(1);
}

export function WeatherHeader({ buckets, leftMargin, rightMargin }: WeatherHeaderProps) {
  return (
    <WeatherContainer>
      <AxisLabels $width={leftMargin}>
        <AxisLabel>&nbsp;</AxisLabel>
        <AxisLabel>°C</AxisLabel>
        <AxisLabel>mm</AxisLabel>
      </AxisLabels>
      <WeatherRow>
        {buckets.map((bucket, i) => (
          <WeatherCell key={i}>
            <WeatherIcon>{getWeatherIcon(bucket.weatherCode)}</WeatherIcon>
            <WeatherValue>{bucket.avgTemperature.toFixed(0)}°</WeatherValue>
            <WeatherValue>{formatPrecipitation(bucket.avgPrecipitation)}</WeatherValue>
          </WeatherCell>
        ))}
      </WeatherRow>
      <AxisSpacer $width={rightMargin} />
    </WeatherContainer>
  );
}
