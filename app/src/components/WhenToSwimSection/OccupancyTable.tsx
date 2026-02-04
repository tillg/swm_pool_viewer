import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { RawDataPoint } from '../../types';
import { OccupancyRow } from './OccupancyRow';
import { TimeSlot, DayOption, getSelectedDate } from './TimeSlotSelector';

const TableContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: ${theme.colors.background.page};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: max-content;
`;

const TableHead = styled.thead`
  background: ${theme.colors.brand.primary};
  color: white;
`;

const HeaderCell = styled.th`
  padding: 10px ${theme.spacing.m};
  text-align: center;
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;

  &:first-child {
    text-align: left;
    position: sticky;
    left: 0;
    background: ${theme.colors.brand.primary};
    z-index: 2;
  }
`;

const EmptyMessage = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.muted};
`;

interface OccupancyTableProps {
  rawData: RawDataPoint[];
  facilities: string[];
  facilityTypes: Map<string, string>;
  colorMap: Map<string, string>;
  visibility: Map<string, boolean>;
  selectedSlot: TimeSlot;
  selectedDay: DayOption;
}

function formatHourRange(hour: number): string {
  return `${hour}-${hour + 1}h`;
}

interface FacilityHourData {
  occupancy: number | null;
  isClosed: boolean;
}

function getOccupancyData(
  rawData: RawDataPoint[],
  facilities: string[],
  selectedSlot: TimeSlot,
  selectedDay: DayOption
): Map<string, Map<number, FacilityHourData>> {
  const result = new Map<string, Map<number, FacilityHourData>>();
  const targetDate = getSelectedDate(selectedDay);

  // Initialize empty maps for each facility
  for (const facility of facilities) {
    const hourMap = new Map<number, FacilityHourData>();
    for (const hour of selectedSlot.hours) {
      hourMap.set(hour, { occupancy: null, isClosed: false });
    }
    result.set(facility, hourMap);
  }

  // Filter raw data for the selected date and hours
  const relevantData = rawData.filter(point => {
    const pointDate = new Date(point.timestamp);
    const isSameDay =
      pointDate.getFullYear() === targetDate.getFullYear() &&
      pointDate.getMonth() === targetDate.getMonth() &&
      pointDate.getDate() === targetDate.getDate();
    return isSameDay && selectedSlot.hours.includes(point.hour);
  });

  // Group by facility and hour, prioritizing historical over forecast
  // Data format: historical data has priority, then forecast
  const dataByFacilityHour = new Map<string, RawDataPoint>();

  for (const point of relevantData) {
    // Create display name matching the Legend format
    let displayName = point.facility_name;
    if (point.facility_type.toLowerCase() === 'sauna') {
      displayName = `${point.facility_name} (Sauna)`;
    }

    const key = `${displayName}:${point.hour}`;

    // Historical data always takes priority
    const existing = dataByFacilityHour.get(key);
    if (!existing || (point.data_source === 'historical' && existing.data_source === 'forecast')) {
      dataByFacilityHour.set(key, point);
    }
  }

  // Populate result map
  for (const [key, point] of dataByFacilityHour) {
    const [displayName, hourStr] = key.split(':');
    const hour = parseInt(hourStr, 10);

    const facilityMap = result.get(displayName);
    if (facilityMap) {
      // Occupancy data is inverted in the raw data (shows available capacity)
      const occupancy = 100 - point.occupancy_percent;
      // Only historical data has is_open field
      const isClosed = point.data_source === 'historical' && point.is_open === 0;
      facilityMap.set(hour, { occupancy, isClosed });
    }
  }

  return result;
}

export function OccupancyTable({
  rawData,
  facilities,
  facilityTypes,
  colorMap,
  visibility,
  selectedSlot,
  selectedDay,
}: OccupancyTableProps) {
  const visibleFacilities = facilities.filter(f => visibility.get(f) ?? true);

  if (visibleFacilities.length === 0) {
    return (
      <TableContainer>
        <EmptyMessage>Bitte wähle mindestens eine Einrichtung aus.</EmptyMessage>
      </TableContainer>
    );
  }

  const occupancyData = getOccupancyData(rawData, visibleFacilities, selectedSlot, selectedDay);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <tr>
            <HeaderCell>Einrichtung</HeaderCell>
            {selectedSlot.hours.map(hour => (
              <HeaderCell key={hour}>{formatHourRange(hour)}</HeaderCell>
            ))}
          </tr>
        </TableHead>
        <tbody>
          {visibleFacilities.map(facility => {
            const facilityData = occupancyData.get(facility);
            const hours = selectedSlot.hours.map(hour => {
              const data = facilityData?.get(hour);
              return {
                hour,
                occupancy: data?.occupancy ?? null,
                isClosed: data?.isClosed ?? false,
              };
            });

            return (
              <OccupancyRow
                key={facility}
                facility={facility}
                facilityType={facilityTypes.get(facility) || 'pool'}
                color={colorMap.get(facility) || '#999'}
                hours={hours}
              />
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
}
