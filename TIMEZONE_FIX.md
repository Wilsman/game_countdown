# Timezone Fix Summary

## Problem
Users in different timezones were seeing different countdown times for the same event.

### Example
- **Korea user (GMT+9)**: Saw 3 days 18 hours
- **London user (GMT+1)**: Saw 4 days 2 hours

## Root Cause
Using `new Date(year, month, day, hour, ...)` constructor creates dates in the **user's local timezone**, not UTC.

```typescript
// ❌ WRONG - Creates date in user's local timezone
new Date(2025, 9, 17, 14, 0, 0)
// In London: Oct 17, 2025 14:00 London time
// In Korea: Oct 17, 2025 14:00 Korea time (8 hours difference!)
```

## Solution
Use ISO 8601 UTC strings with `Z` suffix to ensure all users see the same absolute time.

```typescript
// ✅ CORRECT - Creates date in UTC, same for everyone
new Date("2025-10-17T13:00:00Z")
// Everyone sees: Oct 17, 2025 13:00 UTC
```

## Files Changed

### `src/stores/timer.ts`
Fixed all game timers to use UTC strings:

1. **ARC Raiders Server Slam Start**
   - Before: `new Date(2025, 9, 17, 14, 0, 0)`
   - After: `new Date("2025-10-17T13:00:00Z")` (2pm BST = 1pm UTC)

2. **ARC Raiders Server Slam End**
   - Before: `new Date(2025, 9, 19, 16, 0, 0)`
   - After: `new Date("2025-10-19T15:00:00Z")` (4pm BST = 3pm UTC)

3. **ARC Raiders Full Release**
   - Before: `new Date(2025, 9, 30, 16, 0, 0)`
   - After: `new Date("2025-10-30T16:00:00Z")`

4. **Tarkov 1.0 Release**
   - Before: `new Date(2025, 10, 15, 8, 0, 0)`
   - After: `new Date("2025-11-15T08:00:00Z")`

5. **POE1 3.26**
   - Before: `new Date(2025, 5, 13, 21, 0, 0)`
   - After: `new Date("2025-06-13T21:00:00Z")`

6. **Star Citizen: Squadron 42**
   - Before: `new Date(2025, 11, 1, 0, 0, 0)`
   - After: `new Date("2025-12-01T00:00:00Z")`

7. **Marvel 1943: Rise of Hydra**
   - Before: `new Date(2025, 2, 1, 0, 0, 0)`
   - After: `new Date("2025-03-01T08:00:00Z")` (midnight PST = 8am UTC)

### `src/stores/__tests__/timer.spec.ts`
Updated all tests to verify UTC times using `getUTCMonth()`, `getUTCDate()`, etc.

### `TESTING.md`
Added critical warning about always using UTC time strings.

## Verification

Run tests to verify all dates are correct:
```bash
bun test
```

All 11 tests pass with 72 assertions ✅

## Time Conversion Reference

When converting local times to UTC:

- **BST (British Summer Time)** = UTC+1
  - 2pm BST = 1pm UTC
  - 4pm BST = 3pm UTC

- **PST (Pacific Standard Time)** = UTC-8
  - Midnight PST = 8am UTC

- **PDT (Pacific Daylight Time)** = UTC-7
  - 6am PDT = 1pm UTC

## Best Practice Going Forward

**Always use UTC strings:**
```typescript
{
  id: "game-id",
  title: "Game Title",
  targetDate: new Date("YYYY-MM-DDTHH:mm:ssZ"), // Always use Z suffix
  targetTimezone: "UTC", // or specific timezone for display
  type: "game",
}
```

**Never use constructor format:**
```typescript
// ❌ DON'T DO THIS
targetDate: new Date(2025, 9, 17, 14, 0, 0)
```
