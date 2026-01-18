import styled from 'styled-components';

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
`;

const LegendItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

const ColorDot = styled.span<{ $color: string; $visible: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  opacity: ${props => props.$visible ? 1 : 0.3};
  flex-shrink: 0;
`;

const Checkbox = styled.input`
  margin: 0;
  cursor: pointer;
`;

const FacilityName = styled.span<{ $visible: boolean }>`
  color: ${props => props.$visible ? '#333' : '#999'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface LegendProps {
  facilities: string[];
  colorMap: Map<string, string>;
  visibility: Map<string, boolean>;
  onToggle: (facility: string) => void;
}

export function Legend({ facilities, colorMap, visibility, onToggle }: LegendProps) {
  return (
    <LegendContainer>
      {facilities.map(facility => {
        const color = colorMap.get(facility) || '#999';
        const visible = visibility.get(facility) ?? true;
        return (
          <LegendItem key={facility}>
            <Checkbox
              type="checkbox"
              checked={visible}
              onChange={() => onToggle(facility)}
            />
            <ColorDot $color={color} $visible={visible} />
            <FacilityName $visible={visible}>{facility}</FacilityName>
          </LegendItem>
        );
      })}
    </LegendContainer>
  );
}
