# Design System

Aligned with the official SWM Bäder Auslastung page: https://www.swm.de/baeder/auslastung

---

## Color Palette

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| SWM Blue (Primary) | `#002D5B` | Headers, brand elements |
| SWM Blue Light | `#0065CC` | Links, section titles, interactive elements |
| Blue Background | `#EFF7FE` | Section backgrounds |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#202020` | Body text, headings |
| Text Secondary | `#4A5056` | Secondary text |
| Border | `#CFCFCF` | Borders, dividers |
| Background Page | `#FFFFFF` | Page background |

---

## Typography

### Font Families

```css
--font-primary: 'RobotoRegular', Arial, sans-serif;
--font-bold: 'RobotoBold', Arial, sans-serif;
```

Note: Always pair `font-family: bold` with `font-weight: 700` for consistent rendering when custom fonts fail to load.

### Font Sizes

| Name | Size | Usage |
|------|------|-------|
| Headline XL | `45px` | Hero title |
| Headline L | `37px` | Page titles (Impressum) |
| Headline M | `28px` | Section headers |
| Headline S | `20px` | Subsection headers |
| Body | `16px` | Body text |
| Body Small | `15px` | Links, footer |

---

## Spacing

| Name | Value | Usage |
|------|-------|-------|
| XS | `4px` | Tight spacing |
| S | `8px` | Small gaps |
| M | `16px` | Standard spacing |
| L | `20px` | Card padding |
| XL | `24px` | Section spacing |

---

## Components Built

### Hero Section
- Random pool image from 10 images (`/pool-1.jpg` to `/pool-10.jpg`)
- Full-width, 300px height
- Gradient overlay for text readability

### Legend with Group Toggle
- Facilities grouped by type (Bäder, Saunen, Eislauf)
- Group headers with checkboxes for bulk select/unselect
- Indeterminate checkbox state for partial selections
- Facility type icons (swimmer, sauna, ice skate)

### Footer
- White background
- Links styled: `#0065CC`, 15px, bold with `>>` suffix
- Links to Impressum page

### Impressum Page
- Random pool hero image (same as main page)
- Back link with `<<` prefix
- Section titles: `#0065CC`, 20px, bold
- Body text: 16px, `#202020`
- Sections separated by border dividers

---

## Routing

```typescript
// src/index.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/impressum" element={<Impressum />} />
  </Routes>
</BrowserRouter>
```

Webpack configured with `historyApiFallback: true` for SPA routing.

---

## Central Theme File

All design variables defined in `src/styles/theme.ts`. See that file for the complete theme object including colors, typography, spacing, and border radius values.

---

## Reference

Screenshots and design extraction scripts in this directory were captured from https://www.swm.de/baeder/auslastung
