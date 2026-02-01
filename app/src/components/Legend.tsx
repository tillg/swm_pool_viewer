import styled from 'styled-components';
import { theme } from '../styles/theme';
import { PoolIcon, SaunaIcon, IceRinkIcon, OtherIcon } from '../styles/icons';

const ScrollTrack = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: ${theme.colors.border};
  border-radius: 3px;
`;

const LegendScroller = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${theme.spacing.s} 0;
  padding-right: 12px;
  max-height: 400px;
  overflow-y: auto;

  /* Hide native scrollbar */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const LegendContainer = styled.div`
  position: relative;
`;

const GroupHeader = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.s};
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  margin-top: ${theme.spacing.s};
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.background.light};
  transition: background 0.2s ease;

  &:first-child {
    margin-top: 0;
  }

  &:hover {
    background: ${theme.colors.border};
  }

  ${theme.mediaQueries.mobile} {
    min-height: 44px;
    padding: ${theme.spacing.s} ${theme.spacing.m};
  }
`;

const GroupIconWrapper = styled.span`
  display: flex;
  align-items: center;
  color: ${theme.colors.text.secondary};
  flex-shrink: 0;
`;

const LegendItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.s};
  cursor: pointer;
  font-size: 13px;
  padding: ${theme.spacing.xs} ${theme.spacing.s};
  padding-left: ${theme.spacing.l};
  border-radius: ${theme.borderRadius.small};
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.colors.background.light};
  }

  ${theme.mediaQueries.mobile} {
    min-height: 44px;
    padding: ${theme.spacing.s} ${theme.spacing.m};
    padding-left: ${theme.spacing.xl};
  }
`;

const IconWrapper = styled.span<{ $color: string; $visible: boolean }>`
  display: flex;
  align-items: center;
  color: ${props => props.$color};
  opacity: ${props => props.$visible ? 1 : 0.3};
  flex-shrink: 0;
`;

const Checkbox = styled.input`
  margin: 0;
  cursor: pointer;

  ${theme.mediaQueries.mobile} {
    width: 20px;
    height: 20px;
  }
`;

const FacilityName = styled.span<{ $visible: boolean }>`
  color: ${props => props.$visible ? theme.colors.text.primary : theme.colors.text.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GroupName = styled.span`
  color: ${theme.colors.text.primary};
`;

interface LegendProps {
  facilities: string[];
  facilityTypes: Map<string, string>;
  colorMap: Map<string, string>;
  visibility: Map<string, boolean>;
  onToggle: (facility: string) => void;
  onToggleGroup: (facilities: string[], visible: boolean) => void;
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
      return OtherIcon;
  }
}

function getGroupKey(facilityType: string): string {
  switch (facilityType?.toLowerCase()) {
    case 'hallenbad':
    case 'freibad':
    case 'pool':
      return 'pool';
    case 'sauna':
      return 'sauna';
    case 'eislauf':
    case 'eislaufbahn':
    case 'ice':
    case 'ice_rink':
      return 'ice';
    default:
      return 'other';
  }
}

function getGroupLabel(groupKey: string): string {
  switch (groupKey) {
    case 'pool':
      return 'Bäder';
    case 'sauna':
      return 'Saunen';
    case 'ice':
      return 'Eislaufbahnen';
    case 'other':
      return 'Andere';
    default:
      return groupKey;
  }
}

function getGroupIcon(groupKey: string) {
  switch (groupKey) {
    case 'pool':
      return PoolIcon;
    case 'sauna':
      return SaunaIcon;
    case 'ice':
      return IceRinkIcon;
    case 'other':
      return OtherIcon;
    default:
      return OtherIcon;
  }
}

const GROUP_ORDER = ['pool', 'sauna', 'ice', 'other'];

const LineTypeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.m};
  padding: ${theme.spacing.m} ${theme.spacing.s};
  margin-top: ${theme.spacing.m};
  border-top: 1px solid ${theme.colors.border};
  font-size: 11px;
  color: ${theme.colors.text.secondary};
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

export function Legend({ facilities, facilityTypes, colorMap, visibility, onToggle, onToggleGroup }: LegendProps) {
  // Group facilities by type
  const grouped = new Map<string, string[]>();
  for (const facility of facilities) {
    const type = facilityTypes.get(facility) || 'pool';
    const groupKey = getGroupKey(type);
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey)!.push(facility);
  }

  // Sort groups by predefined order
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    return GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]);
  });

  return (
    <LegendContainer>
      <LegendScroller>
        {sortedGroups.map(([groupKey, groupFacilities]) => {
          const GroupIcon = getGroupIcon(groupKey);
          const allVisible = groupFacilities.every(f => visibility.get(f) ?? true);
          const someVisible = groupFacilities.some(f => visibility.get(f) ?? true);

          return (
            <div key={groupKey}>
              <GroupHeader>
                <Checkbox
                  type="checkbox"
                  checked={allVisible}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisible && !allVisible;
                  }}
                  onChange={() => onToggleGroup(groupFacilities, !allVisible)}
                />
                <GroupIconWrapper>
                  <GroupIcon size={18} />
                </GroupIconWrapper>
                <GroupName>{getGroupLabel(groupKey)}</GroupName>
              </GroupHeader>
              {groupFacilities.map(facility => {
                const color = colorMap.get(facility) || '#999';
                const visible = visibility.get(facility) ?? true;
                const facilityType = facilityTypes.get(facility) || 'pool';
                const Icon = getFacilityIcon(facilityType);
                return (
                  <LegendItem key={facility}>
                    <Checkbox
                      type="checkbox"
                      checked={visible}
                      onChange={() => onToggle(facility)}
                    />
                    <IconWrapper $color={color} $visible={visible}>
                      <Icon size={18} />
                    </IconWrapper>
                    <FacilityName $visible={visible} title={facility}>{facility}</FacilityName>
                  </LegendItem>
                );
              })}
            </div>
          );
        })}
        <LineTypeIndicator>
          <LineTypeSample>
            <SolidLine />
            <span>Historisch</span>
          </LineTypeSample>
          <LineTypeSample>
            <DashedLine />
            <span>Prognose</span>
          </LineTypeSample>
        </LineTypeIndicator>
      </LegendScroller>
      <ScrollTrack />
    </LegendContainer>
  );
}
