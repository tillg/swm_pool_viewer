import styled from 'styled-components';
import { theme } from '../styles/theme';
import { PoolIcon, SaunaIcon, IceRinkIcon } from '../styles/icons';

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${theme.spacing.s} 0;
  max-height: 400px;
  overflow-y: auto;
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
      return IceRinkIcon;
    default:
      return PoolIcon;
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
      return 'ice';
    default:
      return 'pool';
  }
}

function getGroupLabel(groupKey: string): string {
  switch (groupKey) {
    case 'pool':
      return 'Bäder';
    case 'sauna':
      return 'Saunen';
    case 'ice':
      return 'Eislauf';
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
    default:
      return PoolIcon;
  }
}

const GROUP_ORDER = ['pool', 'sauna', 'ice'];

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
                  <FacilityName $visible={visible}>{facility}</FacilityName>
                </LegendItem>
              );
            })}
          </div>
        );
      })}
    </LegendContainer>
  );
}
