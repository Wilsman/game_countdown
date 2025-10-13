# Testing Guide

## Running Tests

```bash
# Run all tests
bun test

# Run verification script
bun run scripts/verify-dates.ts
```

## Test Coverage

### All Game Timers (11 tests, 74 assertions)

✅ **Month Index Reference**
- Verifies JavaScript Date month indexing (0=Jan, 11=Dec)
- Prevents future month indexing errors

✅ **Tarkov 1.0 Release**
- Date: Nov 15, 2025 at 8am UK
- Timezone: Europe/London

✅ **POE1 3.26**
- Date: June 13, 2025 at 9pm
- Timezone: User's local timezone

✅ **Star Citizen: Squadron 42**
- Date: Dec 1, 2025
- Timezone: UTC

✅ **Marvel 1943: Rise of Hydra**
- Date: March 1, 2025
- Timezone: America/Los_Angeles

✅ **ARC Raiders Server Slam (Beta)**
- Start: Oct 17, 2025 at 2pm BST (6am PDT / 9am EDT)
- End: Oct 19, 2025 at 4pm BST (8am PDT / 11am EDT)
- Duration: 50 hours (2 days + 2 hours)
- Timezone: Europe/London

✅ **ARC Raiders Full Release**
- Date: Oct 30, 2025 at 4pm BST
- Timezone: Europe/London
- Regional release times verified for 12 timezones
- All regional times synchronized to 2025-10-30T16:00:00Z

## Important: JavaScript Date Month Indexing

⚠️ **Month parameter is 0-indexed:**
- 0 = January
- 1 = February
- 2 = March
- 3 = April
- 4 = May
- 5 = June
- 6 = July
- 7 = August
- 8 = September
- 9 = October
- 10 = November
- 11 = December

### Example
```typescript
// ✅ Correct: October 17, 2025
new Date(2025, 9, 17, 14, 0, 0)

// ❌ Wrong: November 17, 2025
new Date(2025, 10, 17, 14, 0, 0)
```

## Test Files

- `src/stores/__tests__/timer.spec.ts` - Unit tests using Bun's test runner
- `scripts/verify-dates.ts` - Standalone verification script with detailed output

## Adding New Tests

When adding a new game timer using `new Date(year, month, ...)`:

1. Add a test in `timer.spec.ts`:
```typescript
describe('Your Game Name', () => {
  it('should have correct date: Month Day, Year', () => {
    const releaseDate = new Date(2025, MONTH_INDEX, DAY, HOUR, 0, 0);
    
    expect(releaseDate.getMonth()).toBe(MONTH_INDEX);
    expect(releaseDate.getDate()).toBe(DAY);
    expect(releaseDate.getFullYear()).toBe(2025);
    expect(releaseDate.toDateString()).toContain('MONTH_ABBR');
    
    console.log('Your Game:', releaseDate.toString());
  });
});
```

2. Run tests to verify:
```bash
bun test
```
