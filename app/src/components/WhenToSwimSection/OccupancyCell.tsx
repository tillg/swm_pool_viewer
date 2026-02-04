import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Cell = styled.td<{ $closed?: boolean }>`
  padding: ${theme.spacing.s} ${theme.spacing.m};
  text-align: center;
  min-width: 100px;
  background: ${props => props.$closed ? theme.colors.background.light : 'transparent'};
  opacity: ${props => props.$closed ? 0.5 : 1};
`;

const GaugeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GaugeBar = styled.div`
  flex: 1;
  height: 12px;
  background: #E8E8E8;
  border-radius: 6px;
  overflow: hidden;
`;

const GaugeFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => getGradientForPercentage(props.$percentage)};
  border-radius: 6px;
  transition: width 0.3s ease;
`;

const Percentage = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  min-width: 32px;
  text-align: right;
`;

const NoData = styled.span`
  font-size: ${theme.typography.fontSize.bodySmall};
  color: ${theme.colors.text.muted};
`;

// SWM-style gradient: green at low values, transitions through yellow to orange/red
function getGradientForPercentage(percentage: number): string {
  if (percentage <= 33) {
    return '#7CB342'; // Green
  } else if (percentage <= 66) {
    return 'linear-gradient(to right, #7CB342, #FDD835)'; // Green to Yellow
  } else {
    return 'linear-gradient(to right, #7CB342, #FDD835, #FB8C00)'; // Green to Yellow to Orange
  }
}

interface OccupancyCellProps {
  occupancy: number | null;
  isClosed?: boolean;
}

export function OccupancyCell({ occupancy, isClosed }: OccupancyCellProps) {
  if (isClosed) {
    return (
      <Cell $closed>
        <NoData>geschl.</NoData>
      </Cell>
    );
  }

  if (occupancy === null) {
    return (
      <Cell>
        <NoData>–</NoData>
      </Cell>
    );
  }

  return (
    <Cell>
      <GaugeContainer>
        <GaugeBar>
          <GaugeFill $percentage={occupancy} />
        </GaugeBar>
        <Percentage>{Math.round(occupancy)}%</Percentage>
      </GaugeContainer>
    </Cell>
  );
}
