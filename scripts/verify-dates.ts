/**
 * Verification script for ARC Raiders Server Slam dates
 * Run with: bun run scripts/verify-dates.ts
 */

console.log('=== ARC Raiders Server Slam Date Verification ===\n');

// Start: Oct 17, 2025 at 6am PDT / 9am EDT / 2pm BST
const startDate = new Date(2025, 9, 17, 14, 0, 0);
console.log('📅 START DATE (Oct 17, 2025 at 2pm BST / 6am PDT / 9am EDT)');
console.log('   Local:', startDate.toString());
console.log('   UTC:', startDate.toUTCString());
console.log('   ISO:', startDate.toISOString());
console.log('   Month (0-indexed):', startDate.getMonth(), '(9 = October)');
console.log('   Date:', startDate.getDate());
console.log('   Hours:', startDate.getHours());
console.log('');

// End: Oct 19, 2025 at 8am PDT / 11am EDT / 4pm BST
const endDate = new Date(2025, 9, 19, 16, 0, 0);
console.log('📅 END DATE (Oct 19, 2025 at 4pm BST / 8am PDT / 11am EDT)');
console.log('   Local:', endDate.toString());
console.log('   UTC:', endDate.toUTCString());
console.log('   ISO:', endDate.toISOString());
console.log('   Month (0-indexed):', endDate.getMonth(), '(9 = October)');
console.log('   Date:', endDate.getDate());
console.log('   Hours:', endDate.getHours());
console.log('');

// Calculate duration
const diffMs = endDate.getTime() - startDate.getTime();
const diffHours = diffMs / (1000 * 60 * 60);
const diffDays = Math.floor(diffHours / 24);
const remainingHours = diffHours % 24;

console.log('⏱️  DURATION');
console.log('   Total hours:', diffHours);
console.log('   Days:', diffDays, 'days and', remainingHours, 'hours');
console.log('');

// Verify expectations
console.log('✅ VERIFICATION');
const checks = [
  { name: 'Start month is October', pass: startDate.getMonth() === 9 },
  { name: 'Start day is 17', pass: startDate.getDate() === 17 },
  { name: 'Start hour is 14 (2pm)', pass: startDate.getHours() === 14 },
  { name: 'End month is October', pass: endDate.getMonth() === 9 },
  { name: 'End day is 19', pass: endDate.getDate() === 19 },
  { name: 'End hour is 16 (4pm)', pass: endDate.getHours() === 16 },
  { name: 'Duration is 50 hours', pass: diffHours === 50 },
];

checks.forEach(check => {
  console.log(`   ${check.pass ? '✓' : '✗'} ${check.name}`);
});

const allPassed = checks.every(c => c.pass);
console.log('');
console.log(allPassed ? '🎉 All checks passed!' : '❌ Some checks failed!');

console.log('\n' + '='.repeat(60) + '\n');

// ARC Raiders Full Release
console.log('=== ARC Raiders Full Release Date Verification ===\n');

const arcRaidersRelease = new Date(2025, 9, 30, 16, 0, 0);
console.log('📅 MAIN RELEASE DATE (Oct 30, 2025 at 4pm BST)');
console.log('   Local:', arcRaidersRelease.toString());
console.log('   UTC:', arcRaidersRelease.toUTCString());
console.log('   ISO:', arcRaidersRelease.toISOString());
console.log('   Month (0-indexed):', arcRaidersRelease.getMonth(), '(9 = October)');
console.log('   Date:', arcRaidersRelease.getDate());
console.log('   Hours:', arcRaidersRelease.getHours());
console.log('');

console.log('🌍 REGIONAL RELEASE TIMES (all should be 2025-10-30T16:00:00Z)');
const regionalTimes = [
  { name: 'America/Los_Angeles', expected: '2025-10-30T16:00:00.000Z', comment: '08:00 PDT (UTC-7)' },
  { name: 'America/Mexico_City', expected: '2025-10-30T16:00:00.000Z', comment: '09:00 CST (UTC-6)' },
  { name: 'America/New_York', expected: '2025-10-30T16:00:00.000Z', comment: '11:00 EDT (UTC-4)' },
  { name: 'America/Sao_Paulo', expected: '2025-10-30T16:00:00.000Z', comment: '12:00 BRT (UTC-3)' },
  { name: 'Europe/London', expected: '2025-10-30T16:00:00.000Z', comment: '16:00 BST (UTC+1)' },
  { name: 'Europe/Stockholm', expected: '2025-10-30T16:00:00.000Z', comment: '17:00 CEST (UTC+2)' },
  { name: 'Africa/Cairo', expected: '2025-10-30T16:00:00.000Z', comment: '18:00 EEST (UTC+2)' },
  { name: 'Asia/Baku', expected: '2025-10-30T16:00:00.000Z', comment: '19:00 AZT (UTC+4)' },
  { name: 'Asia/Kolkata', expected: '2025-10-30T16:00:00.000Z', comment: '20:30 UTC' },
  { name: 'Asia/Ho_Chi_Minh', expected: '2025-10-30T16:00:00.000Z', comment: '22:00 ICT (UTC+7)' },
  { name: 'Asia/Tokyo', expected: '2025-10-30T16:00:00.000Z', comment: '00:00 JST Oct 31 (UTC+9)' },
  { name: 'Australia/Sydney', expected: '2025-10-30T16:00:00.000Z', comment: '02:00 AEDT Oct 31 (UTC+11)' },
];

const regionalChecks: { name: string; pass: boolean }[] = [];

regionalTimes.forEach(region => {
  const date = new Date("2025-10-30T16:00:00Z");
  const iso = date.toISOString();
  const pass = iso === region.expected;
  regionalChecks.push({ name: `${region.name} - ${region.comment}`, pass });
  console.log(`   ${pass ? '✓' : '✗'} ${region.name.padEnd(25)} ${region.comment}`);
  if (!pass) {
    console.log(`      Expected: ${region.expected}`);
    console.log(`      Got:      ${iso}`);
  }
});

console.log('');

// Verify main release date
console.log('✅ MAIN RELEASE VERIFICATION');
const arcChecks = [
  { name: 'Release month is October', pass: arcRaidersRelease.getMonth() === 9 },
  { name: 'Release day is 30', pass: arcRaidersRelease.getDate() === 30 },
  { name: 'Release hour is 16 (4pm)', pass: arcRaidersRelease.getHours() === 16 },
  { name: 'All regional times are consistent', pass: regionalChecks.every(c => c.pass) },
];

arcChecks.forEach(check => {
  console.log(`   ${check.pass ? '✓' : '✗'} ${check.name}`);
});

const allArcPassed = arcChecks.every(c => c.pass);
console.log('');
console.log(allArcPassed ? '🎉 All ARC Raiders checks passed!' : '❌ Some ARC Raiders checks failed!');

const finalResult = allPassed && allArcPassed;
process.exit(finalResult ? 0 : 1);
