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
