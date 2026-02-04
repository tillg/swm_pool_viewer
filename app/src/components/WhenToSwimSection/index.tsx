import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { RawDataPoint } from '../../types';
import { Legend } from '../Legend';
import { TimeSlotSelector, TimeSlotSelection, TIME_SLOTS, getSelectedSlot } from './TimeSlotSelector';
import { OccupancyTable } from './OccupancyTable';

const Section = styled.section`
  background: ${theme.colors.background.card};
  padding: ${theme.spacing.xl} 0;
`;

const SectionContent = styled.div`
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
  align-items: center;
  margin-bottom: ${theme.spacing.m};
  gap: ${theme.spacing.m};

  ${theme.mediaQueries.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};

  ${theme.mediaQueries.mobile} {
    flex-direction: column;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const LegendSection = styled.div`
  width: 260px;
  flex-shrink: 0;
  background: ${theme.colors.background.page};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: ${theme.spacing.m};

  ${theme.mediaQueries.mobile} {
    width: 100%;
    order: -1;
  }
`;

const LegendTitle = styled.h3`
  margin: -${theme.spacing.m} -${theme.spacing.m} ${theme.spacing.s} -${theme.spacing.m};
  padding: 10px ${theme.spacing.m};
  font-size: 14px;
  color: white;
  font-weight: 500;
  background: ${theme.colors.brand.primary};
  border-radius: 8px 8px 0 0;
`;

interface WhenToSwimSectionProps {
  rawData: RawDataPoint[];
  facilities: string[];
  facilityTypes: Map<string, string>;
  colorMap: Map<string, string>;
  visibility: Map<string, boolean>;
  onToggle: (facility: string) => void;
  onToggleGroup: (facilities: string[], visible: boolean) => void;
  swimTimeSelection?: TimeSlotSelection;
  onSwimTimeChange?: (selection: TimeSlotSelection) => void;
}

function getDefaultTimeSlot(): TimeSlotSelection {
  const now = new Date();
  const currentHour = now.getHours();

  // Find the appropriate slot based on current time
  for (const slot of TIME_SLOTS) {
    const slotEndHour = slot.hours[slot.hours.length - 1] + 1;
    if (currentHour < slotEndHour) {
      return { day: 'today', slotId: slot.id };
    }
  }

  // If past all slots today, default to first slot tomorrow
  return { day: 'tomorrow', slotId: TIME_SLOTS[0].id };
}

export function WhenToSwimSection({
  rawData,
  facilities,
  facilityTypes,
  colorMap,
  visibility,
  onToggle,
  onToggleGroup,
  swimTimeSelection,
  onSwimTimeChange,
}: WhenToSwimSectionProps) {
  // Use external state if provided, otherwise use local state
  const [localSelection, setLocalSelection] = useState<TimeSlotSelection>(getDefaultTimeSlot);

  const selection = swimTimeSelection ?? localSelection;
  const setSelection = onSwimTimeChange ?? setLocalSelection;

  // Initialize external state with default if not set
  useEffect(() => {
    if (swimTimeSelection === undefined && onSwimTimeChange) {
      onSwimTimeChange(getDefaultTimeSlot());
    }
  }, [swimTimeSelection, onSwimTimeChange]);

  // Memoize the selected slot to avoid recalculation
  const selectedSlot = useMemo(() => getSelectedSlot(selection.slotId), [selection.slotId]);

  if (!selectedSlot) return null;

  return (
    <Section>
      <SectionContent>
        <SectionTitle>Wann und wo schwimmen/saunieren/eislaufen?</SectionTitle>
        <Header>
          <TimeSlotSelector value={selection} onChange={setSelection} />
        </Header>
        <MainContent>
          <TableWrapper>
            <OccupancyTable
              rawData={rawData}
              facilities={facilities}
              facilityTypes={facilityTypes}
              colorMap={colorMap}
              visibility={visibility}
              selectedSlot={selectedSlot}
              selectedDay={selection.day}
            />
          </TableWrapper>
          <LegendSection>
            <LegendTitle>Einrichtung</LegendTitle>
            <Legend
              facilities={facilities}
              facilityTypes={facilityTypes}
              colorMap={colorMap}
              visibility={visibility}
              onToggle={onToggle}
              onToggleGroup={onToggleGroup}
            />
          </LegendSection>
        </MainContent>
      </SectionContent>
    </Section>
  );
}
