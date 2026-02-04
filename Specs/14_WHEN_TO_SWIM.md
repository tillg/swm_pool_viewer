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

| Slot | Hours | Columns |
|------|-------|---------|
| Früh morgens | 7-10h | 7-8, 8-9, 9-10 |
| Vormittags | 9-12h | 9-10, 10-11, 11-12 |
| Mittagszeit | 11-14h | 11-12, 12-13, 13-14 |
| Nachmittags | 14-17h | 14-15, 15-16, 16-17 |
| Abends | 16-19h | 16-17, 17-18, 18-19 |
| Spät abends | 19-23h | 19-20, 20-21, 21-22, 22-23 |

Combined with "heute" / "morgen".

Past time slots (e.g., "Früh morgens heute" at 3pm) remain selectable and show historical data from that specific date.

## Table Display

- **Rows**: One per user-selected facility
- **Columns**: 1-hour intervals within selected time slot
- **Cells**: Occupancy percentage + horizontal progress bar

## Data Source

Filter `fetchOccupancyData()` by the specific calendar date and hour range selected. For each cell, use:

1. Historical data if available (exact timestamp match)
2. Forecast data as fallback
3. "–" if no data

Gray out cells only when historical data shows `is_open = false`. Forecast cells are never grayed out.

## Occupancy Gauge

Horizontal progress bar:

- Bar height: ~15px
- Empty background: `#f5f5f5`
- Colors by occupancy level:
  - **Green** `#52AE32`: 0-50%
  - **Yellow** `#FFC107`: 50-75%
  - **Red** `#E53935`: 75-100%

## Mobile

Horizontal scroll for the table when columns don't fit.

## Component Structure

```text
WhenToSwimSection/
├── TimeSlotSelector.tsx    # Dropdown: day + time slot
├── OccupancyTable.tsx      # Container mapping facilities → rows
├── OccupancyRow.tsx        # Single facility row
└── OccupancyCell.tsx       # Cell with gauge + percentage
```

## Open Items

- Verify yellow/red thresholds match user expectations (SWM's exact values not publicly documented)
