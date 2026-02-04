# When to Swim

## Goal

Answer "Where can I swim best this afternoon?" with a quick-glance table showing occupancy for selected facilities across time slots.

## Location

New section between Hero and the existing chart ("Auslastung-Historie").

## Facility Selection

One shared Legend component controls visibility for both the new table and the existing chart. Layout:

- **Desktop**: Legend next to the table
- **Mobile**: Legend above the table

## Time Slot Selector

Dropdown combining day + time-of-day (12 total options):

| Slot | Hours |
|------|-------|
| früh morgens | 7-10h |
| vormittags | 9-12h |
| mittags | 11-14h |
| nachmittags | 14-17h |
| abends | 16-19h |
| spät abends | 19-23h |

Combined with "Heute" / "Morgen".

Default selection: current or next applicable time slot.

## Table Display

- **Rows**: One per user-selected facility
- **Columns**: 1-hour intervals within selected time slot
- **Cells**: Horizontal progress bar + occupancy percentage

## Data Source

Filter `fetchOccupancyData()` by the specific calendar date and hour range. For each cell, use:

1. Historical data if available (exact timestamp match)
2. Forecast data as fallback
3. "–" if no data

Cells show "geschl." when facility is closed.

## Occupancy Gauge

Horizontal progress bar with gradient fill based on occupancy:

- **Green** (`#7CB342`): 0-33%
- **Green→Yellow gradient**: 33-66%
- **Green→Yellow→Orange gradient**: 66-100%

## Component Structure

```
WhenToSwimSection/
├── index.tsx              # Main section with layout
├── TimeSlotSelector.tsx   # Dropdown: day + time slot
├── OccupancyTable.tsx     # Container mapping facilities → rows
├── OccupancyRow.tsx       # Single facility row
└── OccupancyCell.tsx      # Cell with gauge + percentage
```
