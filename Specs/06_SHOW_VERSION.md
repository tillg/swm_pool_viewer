# Show Version in Footer

## Goal
Display build version and copyright in the footer, automatically updated on each build.

## Footer Layout
```
[Impressum] [Was noch kommt]

Build 45 vom 2026-01-20 20:05 (Deutsche Zeit)          © 2026 Till Gartner
```

- New row below existing footer links
- Left: Build number and timestamp
- Right: Copyright (year is dynamic)

### Styling
- Font: 12px, normal weight (400)
- Color: `#888888` (light gray)
- Line height: 18px

## Technical Approach

**Webpack DefinePlugin** injects build info at compile time:
- **Build number:** Git commit count (`git rev-list --count HEAD`)
- **Build date:** Timestamp in German timezone (Europe/Berlin)

Values are baked into the bundle during build – no runtime fetches needed.
