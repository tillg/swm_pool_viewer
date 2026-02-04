import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { PoolIcon, SaunaIcon, IceRinkIcon } from '../../styles/icons';
import { OccupancyCell } from './OccupancyCell';

const Row = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background: #FAFAFA;
  }
`;

const FacilityCell = styled.td`
  padding: 10px ${theme.spacing.m};
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: ${theme.colors.border};
  }
`;

const IconWrapper = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  color: ${props => props.$color};
  margin-right: 8px;
  vertical-align: middle;
`;

interface HourData {
  hour: number;
  occupancy: number | null;
  isClosed: boolean;
}

interface OccupancyRowProps {
  facility: string;
  facilityType: string;
  color: string;
  hours: HourData[];
}

function getFacilityIcon(facilityType: string) {
  switch (facilityType?.toLowerCase()) {
    case 'hallenbad':
    case 'freibad':
    case 'pool':
      return PoolIcon;
    case 'sauna':
      return SaunaIcon;
    case 'eislauf':
    case 'eislaufbahn':
    case 'ice':
    case 'ice_rink':
      return IceRinkIcon;
    default:
      return PoolIcon;
  }
}

export function OccupancyRow({ facility, facilityType, color, hours }: OccupancyRowProps) {
  const Icon = getFacilityIcon(facilityType);

  return (
    <Row>
      <FacilityCell>
        <IconWrapper $color={color}>
          <Icon size={18} />
        </IconWrapper>
        {facility}
      </FacilityCell>
      {hours.map(({ hour, occupancy, isClosed }) => (
        <OccupancyCell
          key={hour}
          occupancy={occupancy}
          isClosed={isClosed}
        />
      ))}
    </Row>
  );
}
