import styled from 'styled-components';
import { TimeRange } from '../types';

const ToggleContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid #4e79a7;
  border-radius: 4px;
  background: ${props => props.$active ? '#4e79a7' : 'white'};
  color: ${props => props.$active ? 'white' : '#4e79a7'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#3d6a96' : '#f0f4f8'};
  }
`;

interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
  return (
    <ToggleContainer>
      <ToggleButton
        $active={value === 'week'}
        onClick={() => onChange('week')}
      >
        Last week
      </ToggleButton>
      <ToggleButton
        $active={value === '2days'}
        onClick={() => onChange('2days')}
      >
        Last 2 days
      </ToggleButton>
    </ToggleContainer>
  );
}
