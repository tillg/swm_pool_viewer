# Chart UI Improvements

Visual enhancements to the occupancy chart and consistent footer across all pages.

## Changes

### Chart Axis Labels

* **German day abbreviations:** Mo, Di, Mi, Do, Fr, Sa, So (instead of English)
* **Clock symbol:** Simple line-based `◷` before time to distinguish from date format
* **Format:** `Do ◷ 20:15` (day, clock, time)
* **Y-axis label:** Renamed from "Occupancy" to "Auslastung"
* **Label styling:** Black (#000) for better readability, 12px font (14px for "Auslastung")

### Day/Night Background

* **Smooth hourly gradient:** Renders one rectangle per hour with varying opacity
* **Exponential curve:** Uses `Math.pow(intensity, 3)` for sharper day/night transitions
* **Midnight lines:** Dashed vertical lines at midnight for day boundaries
* **Color:** Slate gray (#cbd5e1) with max 40% opacity

### Footer

* **2-column grid layout** with 80px column gap
* **3 links:** Startseite, Was noch kommt, Impressum
* **Consistent across all pages:** Main page, Impressum, and Todo now use shared `<Footer />` component
* **Build info and copyright** in bottom row

## Files Modified

* `app/src/components/OccupancyChart.tsx` - Chart axis labels and day/night shading
* `app/src/components/Footer.tsx` - 2-column layout, added Startseite link
* `app/src/pages/Impressum.tsx` - Use shared Footer component
* `app/src/pages/Todo.tsx` - Use shared Footer component
