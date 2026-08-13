const test = require('node:test');
const assert = require('node:assert/strict');

const { getMatchRating } = require('../src/services/colorLogic/seasonCompatibility');

// The complete 4x4 user-season x product-season matrix. Diagonal (same season)
// is 'good'; same-undertone pairs (warm: spring/autumn, cool: summer/winter)
// are 'fair'; cross-undertone pairs are 'poor'.
//
//            product ->  spring  summer  autumn  winter
//   user spring          good    poor    fair    poor
//   user summer          poor    good    poor    fair
//   user autumn          fair    poor    good    poor
//   user winter          poor    fair    poor    good
const EXPECTED = {
  spring: { spring: 'good', summer: 'poor', autumn: 'fair', winter: 'poor' },
  summer: { spring: 'poor', summer: 'good', autumn: 'poor', winter: 'fair' },
  autumn: { spring: 'fair', summer: 'poor', autumn: 'good', winter: 'poor' },
  winter: { spring: 'poor', summer: 'fair', autumn: 'poor', winter: 'good' }
};

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

test('getMatchRating covers all 16 season combinations', () => {
  for (const userSeason of SEASONS) {
    for (const productSeason of SEASONS) {
      assert.equal(
        getMatchRating(userSeason, productSeason),
        EXPECTED[userSeason][productSeason],
        `${userSeason} user vs ${productSeason} product`
      );
    }
  }
});

test('same season is always a good match', () => {
  for (const season of SEASONS) {
    assert.equal(getMatchRating(season, season), 'good');
  }
});

test('matching is symmetric between user and product season', () => {
  for (const a of SEASONS) {
    for (const b of SEASONS) {
      assert.equal(getMatchRating(a, b), getMatchRating(b, a), `${a} <-> ${b}`);
    }
  }
});

test('season inputs are case-insensitive and trimmed', () => {
  assert.equal(getMatchRating('  Spring ', 'AUTUMN'), 'fair');
  assert.equal(getMatchRating('Winter', 'winter'), 'good');
});

test('always returns one of good/fair/poor', () => {
  const ratings = new Set(['good', 'fair', 'poor']);
  for (const a of SEASONS) {
    for (const b of SEASONS) {
      assert.ok(ratings.has(getMatchRating(a, b)));
    }
  }
});

test('throws on an unknown season', () => {
  assert.throws(() => getMatchRating('spring', 'autism'), /Unknown season/);
  assert.throws(() => getMatchRating('bogus', 'winter'), /Unknown season/);
});

module.exports = { EXPECTED };
