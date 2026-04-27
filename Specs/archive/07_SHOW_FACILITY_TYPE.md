# Show correct facility type

## Problem

Ice rinks (`ice_rink`) display as "Bäder" instead of their own category. Unmatched facility types fall through to the default case which returns `'pool'`.

## Solution

Update `app/src/components/Legend.tsx` to recognize `'ice_rink'` and handle unknown types as "Andere".

### Changes to Legend.tsx

Update these four switch statements:

1. **`getFacilityIcon()`** - Add `'ice_rink'` case → `IceRinkIcon`, default → `OtherIcon`
2. **`getGroupKey()`** - Add `'ice_rink'` case → `'ice'`, default → `'other'`
3. **`getGroupLabel()`** - Change `'ice'` → `'Eislaufbahnen'`, add `'other'` → `'Andere'`
4. **`getGroupIcon()`** - Add `'other'` case → `OtherIcon`

Also update:
- **`GROUP_ORDER`** - Add `'other'` at the end
- **Import** - Add `OtherIcon` from icons

### Changes to icons.tsx

Add a new `OtherIcon` component using a simple building icon (same style as existing icons: 64x64 viewBox, monochrome fill, `currentColor`).

## Facility type mapping

| Data type | Group key | German label   |
|-----------|-----------|----------------|
| pool      | pool      | Bäder          |
| sauna     | sauna     | Saunen         |
| ice_rink  | ice       | Eislaufbahnen  |
| (unknown) | other     | Andere         |
