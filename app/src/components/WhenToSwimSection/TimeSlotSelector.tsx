import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Select = styled.select`
  padding: ${theme.spacing.s} ${theme.spacing.m};
  font-size: ${theme.typography.fontSize.body};
  font-family: ${theme.typography.fontFamily.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.background.page};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  min-width: 200px;

  &:hover {
    border-color: ${theme.colors.brand.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.brand.primary};
  }

  ${theme.mediaQueries.mobile} {
    width: 100%;
    min-height: 44px;
  }
`;

export interface TimeSlot {
  id: string;
  label: string;
  hours: number[];
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'early', label: 'früh morgens', hours: [7, 8, 9] },
  { id: 'morning', label: 'vormittags', hours: [9, 10, 11] },
  { id: 'midday', label: 'mittags', hours: [11, 12, 13] },
  { id: 'afternoon', label: 'nachmittags', hours: [14, 15, 16] },
  { id: 'evening', label: 'abends', hours: [16, 17, 18] },
  { id: 'late', label: 'spät abends', hours: [19, 20, 21, 22] },
];

export type DayOption = 'today' | 'tomorrow';

export interface TimeSlotSelection {
  day: DayOption;
  slotId: string;
}

interface TimeSlotSelectorProps {
  value: TimeSlotSelection;
  onChange: (selection: TimeSlotSelection) => void;
}

function formatOption(slot: TimeSlot, day: DayOption): string {
  const dayLabel = day === 'today' ? 'Heute' : 'Morgen';
  return `${dayLabel} ${slot.label}`;
}

export function TimeSlotSelector({ value, onChange }: TimeSlotSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [day, slotId] = e.target.value.split(':') as [DayOption, string];
    onChange({ day, slotId });
  };

  const currentValue = `${value.day}:${value.slotId}`;

  return (
    <Select value={currentValue} onChange={handleChange}>
      {(['today', 'tomorrow'] as DayOption[]).map(day => (
        TIME_SLOTS.map(slot => (
          <option key={`${day}:${slot.id}`} value={`${day}:${slot.id}`}>
            {formatOption(slot, day)}
          </option>
        ))
      ))}
    </Select>
  );
}

export function getSelectedSlot(slotId: string): TimeSlot | undefined {
  return TIME_SLOTS.find(s => s.id === slotId);
}

export function getSelectedDate(day: DayOption): Date {
  const date = new Date();
  if (day === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}
