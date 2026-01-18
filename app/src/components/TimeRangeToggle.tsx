import styled from 'styled-components';
import { TimeRange } from '../types';
import { theme } from '../styles/theme';

const ToggleContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.s};
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.s} ${theme.spacing.m};
  border: 1px solid ${theme.colors.brand.secondary};
  border-radius: ${theme.borderRadius.medium};
  background: ${props => props.$active ? theme.colors.brand.secondary : theme.colors.background.page};
  color: ${props => props.$active ? theme.colors.background.page : theme.colors.brand.secondary};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.bodySmall};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? theme.colors.brand.primary : theme.colors.background.light};
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
        Letzte Woche
      </ToggleButton>
      <ToggleButton
        $active={value === '2days'}
        onClick={() => onChange('2days')}
      >
        Letzte 2 Tage
      </ToggleButton>
    </ToggleContainer>
  );
}
