const test = require('node:test');
const assert = require('node:assert/strict');

const { classifyUndertone, rgbToLab } = require('../src/services/colorLogic/undertoneClassifier');

// Labelled skin swatches used to calibrate the CIELAB thresholds.
const WARM_SWATCHES = ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
const COOL_SWATCHES = ['#F5D5C5', '#E8B7B7', '#D8A0A0', '#C99789'];
const NEUTRAL_SWATCHES = ['#EAC3A6', '#C8A27C'];

test('classifies warm skin swatches as warm', () => {
  for (const hex of WARM_SWATCHES) {
    assert.equal(classifyUndertone(hex), 'warm', `${hex} should be warm`);
  }
});

test('classifies cool skin swatches as cool', () => {
  for (const hex of COOL_SWATCHES) {
    assert.equal(classifyUndertone(hex), 'cool', `${hex} should be cool`);
  }
});

test('classifies balanced skin swatches as neutral', () => {
  for (const hex of NEUTRAL_SWATCHES) {
    assert.equal(classifyUndertone(hex), 'neutral', `${hex} should be neutral`);
  }
});

test('accepts hex values with or without a leading #', () => {
  assert.equal(classifyUndertone('#E0AC69'), classifyUndertone('E0AC69'));
});

test('always returns one of warm/cool/neutral', () => {
  const valid = new Set(['warm', 'cool', 'neutral']);
  for (const hex of [...WARM_SWATCHES, ...COOL_SWATCHES, ...NEUTRAL_SWATCHES]) {
    assert.ok(valid.has(classifyUndertone(hex)));
  }
});

test('rgbToLab returns known anchors for white and black', () => {
  const white = rgbToLab({ r: 255, g: 255, b: 255 });
  assert.ok(Math.abs(white.L - 100) < 0.5, 'white L* ~ 100');
  assert.ok(Math.abs(white.a) < 0.5 && Math.abs(white.b) < 0.5, 'white is achromatic');

  const black = rgbToLab({ r: 0, g: 0, b: 0 });
  assert.ok(Math.abs(black.L) < 0.5, 'black L* ~ 0');
});
