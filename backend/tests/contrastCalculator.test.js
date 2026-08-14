const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateContrast } = require('../src/services/colorLogic/contrastCalculator');

test('returns high contrast for widely separated features', () => {
  // Very light skin, black hair, dark eyes -> large lightness spread.
  assert.equal(calculateContrast('#FFFFFF', '#000000', '#1A1A1A'), 'high');
});

test('returns low contrast for closely matched features', () => {
  // Skin, hair, and eyes at similar lightness -> small spread.
  assert.equal(calculateContrast('#909090', '#8A8A8A', '#959595'), 'low');
});

test('is driven by the lightest and darkest feature regardless of order', () => {
  const a = calculateContrast('#FFFFFF', '#101010', '#808080');
  const b = calculateContrast('#101010', '#808080', '#FFFFFF');
  assert.equal(a, b);
  assert.equal(a, 'high');
});

test('always returns either high or low', () => {
  const result = calculateContrast('#C8A27C', '#5A4632', '#3B2A1A');
  assert.ok(result === 'high' || result === 'low');
});

test('ignores missing (null/undefined) features instead of throwing', () => {
  // Hijab / head-covering case: no hair_color. Contrast is still measurable from
  // the remaining features (very light skin + dark eyes -> high).
  assert.equal(calculateContrast('#FFFFFF', null, '#1A1A1A'), 'high');
  assert.equal(calculateContrast('#FFFFFF', undefined, '#1A1A1A'), 'high');
});

test('uses whatever valid features remain (skin + eyebrow + lip, no hair)', () => {
  // No hair, no eyes — skin, eyebrow and lip still give a valid spread.
  const result = calculateContrast('#F0D5B8', null, undefined, '#2A1B10', '#B5544E');
  assert.ok(result === 'high' || result === 'low');
});

test('falls back to low contrast when fewer than two features are present', () => {
  assert.equal(calculateContrast('#E0AC69'), 'low');
  assert.equal(calculateContrast('#E0AC69', null, undefined), 'low');
});
