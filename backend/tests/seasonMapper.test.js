const test = require('node:test');
const assert = require('node:assert/strict');

const { mapToSeason } = require('../src/services/colorLogic/seasonMapper');

// The full undertone x contrast -> season mapping table. Every one of the six
// valid combinations must resolve to a concrete season, and neutral must have
// its own path rather than collapsing into cool.
const MAPPING_TABLE = [
  { undertone: 'warm', contrast: 'high', season: 'spring' },
  { undertone: 'warm', contrast: 'low', season: 'autumn' },
  { undertone: 'cool', contrast: 'high', season: 'winter' },
  { undertone: 'cool', contrast: 'low', season: 'summer' },
  { undertone: 'neutral', contrast: 'high', season: 'spring' },
  { undertone: 'neutral', contrast: 'low', season: 'summer' }
];

test('maps every undertone/contrast combination to the expected season', () => {
  for (const { undertone, contrast, season } of MAPPING_TABLE) {
    assert.equal(
      mapToSeason(undertone, contrast),
      season,
      `${undertone}/${contrast} should map to ${season}`
    );
  }
});

test('always returns one of the four seasons', () => {
  const seasons = new Set(['spring', 'summer', 'autumn', 'winter']);
  for (const { undertone, contrast } of MAPPING_TABLE) {
    assert.ok(seasons.has(mapToSeason(undertone, contrast)));
  }
});

test('neutral does not collapse onto the cool path', () => {
  // Neutral+high differs from cool+high (winter); neutral gets its own result.
  assert.notEqual(
    mapToSeason('neutral', 'high'),
    mapToSeason('cool', 'high')
  );
});
