const test = require('node:test');
const assert = require('node:assert/strict');

const { classifyUndertone } = require('../src/services/colorLogic/undertoneClassifier');
const { calculateContrast } = require('../src/services/colorLogic/contrastCalculator');
const { mapToSeason } = require('../src/services/colorLogic/seasonMapper');
const { buildExplanation } = require('../src/services/colorLogic/explanationBuilder');

// A PerfectCorp color result for a user wearing a hijab: skin/eye/eyebrow/lip
// present, hair_color absent (hair is not visible in the photo).
const HIJAB_COLORS = {
  skin_color: '#E0AC69',
  eye_color: '#5A4632',
  eyebrow_color: '#2A1B10',
  lip_color: '#B5544E',
};

// Mirror how the controller assembles contrast features when hair is missing.
function contrastFor(colors) {
  const features = [colors.skin_color, colors.eye_color];
  if (colors.hair_color) {
    features.push(colors.hair_color);
  } else {
    features.push(colors.eyebrow_color, colors.lip_color);
  }
  return calculateContrast(...features);
}

test('color logic produces a valid classification with no hair_color', () => {
  const undertone = classifyUndertone(HIJAB_COLORS.skin_color);
  const contrast = contrastFor(HIJAB_COLORS);
  const season = mapToSeason(undertone, contrast);

  assert.ok(['warm', 'cool', 'neutral'].includes(undertone));
  assert.ok(['high', 'low'].includes(contrast));
  assert.ok(['spring', 'summer', 'autumn', 'winter'].includes(season));
});

test('explanation omits hair when hair_color is absent', () => {
  const undertone = classifyUndertone(HIJAB_COLORS.skin_color);
  const contrast = contrastFor(HIJAB_COLORS);
  const season = mapToSeason(undertone, contrast);

  const withHair = buildExplanation(season, undertone, contrast, { hairVisible: true });
  const noHair = buildExplanation(season, undertone, contrast, { hairVisible: false });

  assert.ok(withHair.toLowerCase().includes('hair'));
  assert.ok(!noHair.toLowerCase().includes('hair'));
  assert.ok(!noHair.includes('undefined'));
});

test('explanation defaults to the hair-visible phrasing', () => {
  const text = buildExplanation('spring', 'warm', 'high');
  assert.ok(text.toLowerCase().includes('hair'));
});

// --- Service-level validation: skin_color required, everything else optional ---

// Stub the PerfectCorp service's dependencies, then drive analyzeSkinTone with a
// canned poll result. node:test runs each test file in its own process, so this
// module-cache manipulation does not leak into other files.
function loadServiceWithPollResult(getPollResult) {
  const stub = (rel, exports) => {
    const p = require.resolve(rel);
    require.cache[p] = { id: p, filename: p, loaded: true, exports };
  };
  stub('../src/services/perfectCorp/client', {
    post: async () => ({
      data: { data: { files: [{ file_id: 'f1', requests: [{ url: 'http://s3', headers: {} }] }], task_id: 't1' } },
    }),
  });
  stub('../src/services/perfectCorp/auth.service', { getAccessToken: async () => 'token' });
  stub('../src/utils/fileUpload', { uploadToS3: async () => {} });
  stub('../src/utils/polling', { pollTaskStatus: async () => getPollResult() });

  delete require.cache[require.resolve('../src/services/perfectCorp/skinToneAnalysis.service')];
  return require('../src/services/perfectCorp/skinToneAnalysis.service');
}

test('analyzeSkinTone succeeds when hair_color is absent', async () => {
  const { analyzeSkinTone } = loadServiceWithPollResult(() => ({
    data: { results: { color: { ...HIJAB_COLORS }, dst_id: 'd1' } },
  }));

  const result = await analyzeSkinTone(Buffer.from('x'), 'face.jpg', 'image/jpeg');

  assert.equal(result.skin_color, HIJAB_COLORS.skin_color);
  assert.equal(result.hair_color, undefined);
  assert.equal(result.eye_color, HIJAB_COLORS.eye_color);
});

test('analyzeSkinTone still rejects a response missing skin_color', async () => {
  const { analyzeSkinTone } = loadServiceWithPollResult(() => ({
    data: { results: { color: { hair_color: '#3B2A1A', eye_color: '#5A4632' } } },
  }));

  await assert.rejects(
    analyzeSkinTone(Buffer.from('x'), 'face.jpg', 'image/jpeg'),
    (err) => {
      assert.equal(err.statusCode, 502);
      assert.equal(err.code, 'incomplete_color_analysis');
      assert.match(err.message, /skin_color/);
      return true;
    }
  );
});
