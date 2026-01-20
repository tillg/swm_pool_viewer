# Mobile Friendly

The current site looks good on desktop/iPad but not on phones. This spec defines mobile responsive behavior.

## Breakpoints

Add to `theme.ts`:
- `mobile`: < 768px
- `tablet`: 768px+ (behaves like desktop)

## Approach

**CSS-only**: Use media queries for sizing/spacing, flexbox `order` for reordering. No JS needed.

---

## Mobile Layout Changes (< 768px)

### 1. Hero
Follow SWM mobile pattern (see `image.png`):
- Shorter image height (~250px)
- Title box overlaps bottom of image, extending below
- Match SWM's mobile title font sizing

### 2. Chart + Legend Section
- Stack vertically (chart on top, legend below)
- Legend full-width
- Chart horizontally scrollable (~700px min-width, overflow-x scroll)

### 3. Touch Targets
- Legend checkbox/label tap area min 44px height

### 4. Footer
- Stack links vertically (see `image-1.png` for SWM reference)

---

## Files to Modify

1. `app/src/styles/theme.ts` - Add breakpoints
2. `app/src/components/Hero.tsx` - Responsive hero
3. `app/src/App.tsx` - Stack chart/legend, scrollable chart container
4. `app/src/components/Legend.tsx` - Larger touch targets
5. `app/src/components/Footer.tsx` - Vertical link stacking
