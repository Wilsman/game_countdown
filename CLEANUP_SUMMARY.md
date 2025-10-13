# Timer Store Cleanup Summary

**Date**: October 13, 2025  
**Action**: Removed past events and ensured all future games use UTC time strings

## Removed Past Events (Before Oct 13, 2025)

### Battlefield 6 Beta Events
- ❌ `bf6-early-access` - Aug 7, 2025
- ❌ `bf6-weekend1` - Aug 9, 2025
- ❌ `bf6-weekend2` - Aug 14, 2025
- ❌ `bf6-release-2025-10-10` - Oct 10, 2025

### Tarkov Events
- ❌ `tarkov-wipe-maintenance` - July 9, 2025
- ❌ `tarkov-wipe-start` - July 9, 2025
- ❌ `tarkov-maintenance-start-2025-08-19` - Aug 19, 2025
- ❌ `tarkov-maintenance-end-2025-08-20` - Aug 20, 2025
- ❌ `tarkov-patch-0-16-9-0-install` - Aug 20, 2025
- ❌ `tarkov-patch-0-16-9-0-install-end` - Aug 20, 2025
- ❌ `tarkov-softcore` - Oct 8, 2025

### Other Past Games
- ❌ `poe-3-26` - June 13, 2025
- ❌ `marvel-1943` - March 1, 2025
- ❌ `metal-gear-solid-delta-snake-eater-2025-08-28` - Aug 28, 2025
- ❌ `path-of-exile-2` - Aug 29, 2025
- ❌ `borderlands-4` - Sep 11, 2025
- ❌ `no-im-not-a-human` - Sep 15, 2025
- ❌ `dying-light-the-beast` - Sep 18, 2025
- ❌ `jump-space` - Sep 19, 2025
- ❌ `ghost-of-yotei-2025-10-02` - Oct 2, 2025
- ❌ `cod-open-beta` - Oct 4, 2025
- ❌ `kingmakers` - Oct 8, 2025
- ❌ `blue-protocol-star-resonance-2025-10-09` - Oct 9, 2025
- ❌ `little-nightmares-3-2025-10-09` - Oct 9, 2025
- ❌ `new-world-nighthaven-2025-10-13` - Oct 13, 2025

**Total Removed**: 24 past events

## Remaining Future Games (All Using UTC Strings ✅)

### Utility Timers (Unchanged)
- `break-30` - Be Right Back (30min)
- `break-15` - Be Right Back (15min)
- `break-10` - Be Right Back (10min)
- `break-5` - Snack Break (5min)

### October 2025
- ✅ `road-to-vostok` - Oct 15, 2025
- ✅ `fellowship-2025-10-16` - Oct 16, 2025
- ✅ `escape-from-duckov` - Oct 16, 2025
- ✅ `keeper-2025-10-17` - Oct 17, 2025
- ✅ `arc-raiders-open-beta-start` - Oct 17, 2025 at 1pm UTC (2pm BST)
- ✅ `arc-raiders-open-beta-end` - Oct 19, 2025 at 3pm UTC (4pm BST)
- ✅ `painkiller-2025-10-21` - Oct 21, 2025
- ✅ `vampire-bloodlines-2-2025-10-21` - Oct 21, 2025
- ✅ `ninja-gaiden-4-2025-10-21` - Oct 21, 2025
- ✅ `misery` - Oct 23, 2025 at 5pm UTC
- ✅ `outer-worlds-2-2025-10-29` - Oct 29, 2025
- ✅ `arc-raiders` - Oct 30, 2025 at 4pm UTC
- ✅ `halloween-tarkov-event` - Oct 31, 2025

### November 2025
- ✅ `slay-the-spire-2` - Nov 1, 2025
- ✅ `call-of-duty-black-ops-7-2025-11-14` - Nov 14, 2025
- ✅ `tarkov-1-0-release` - Nov 15, 2025 at 8am UTC

### December 2025
- ✅ `starcitizen-42` - Dec 1, 2025
- ✅ `midnight-walkers` - Dec 1, 2025

### 2026
- ✅ `enter-the-gungeon-2` - Jan 1, 2026
- ✅ `high-on-life-2-13-february-2026` - Feb 13, 2026

**Total Remaining**: 24 future games + 4 utility timers

## Key Changes

### All Game Timers Now Use UTC Strings
Every game timer now uses the ISO 8601 UTC format to ensure consistent countdown times across all timezones:

```typescript
// ✅ Correct format used everywhere
targetDate: new Date("2025-10-17T13:00:00Z")
```

### Benefits
1. **Consistent Experience**: All users worldwide see the same countdown
2. **No Timezone Bugs**: Eliminates the local timezone issue that caused different countdown times
3. **Easy to Verify**: UTC times are unambiguous and testable
4. **Future-Proof**: New games added will follow this pattern

## Verification

All tests pass:
```bash
bun test
# ✅ 11 tests pass, 72 assertions
```

## Next Steps

When adding new games:
1. Always use UTC time strings: `new Date("YYYY-MM-DDTHH:mm:ssZ")`
2. Never use constructor format: `new Date(year, month, day, ...)`
3. Add tests for new games in `timer.spec.ts`
4. Run `bun test` to verify
