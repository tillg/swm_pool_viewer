# Keep state in localStorage

Currently when a user reloads the page, all settings (time period, facility visibility) are reset. These should persist so the user sees the same view as their last visit.

## State to persist

- `timeRange`: 'week' | '2days'
- `visibility`: Map of facility name → boolean

## Approach

Use **localStorage** to persist state:

- Simple API (`localStorage.setItem/getItem`)
- No size concerns
- Not sent with HTTP requests
- No cookie consent needed

## Behavior

- On page load: read saved state from localStorage, apply it
- On state change: write updated state to localStorage
- New facilities (not in saved visibility): default to **visible**
