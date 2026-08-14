const test = require('node:test');
const assert = require('node:assert/strict');

// Audit hardening — full controller flow (analyzeSkin). Mocks the PerfectCorp
// service and Firestore, then drives the real controller with each partial /
// malformed color payload to prove it never crashes and always returns a valid
// classification. `node --test` isolates each file in its own process, so the
// require.cache stubs here do not leak.

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const UNDERTONES = ['warm', 'cool', 'neutral'];
const CONTRASTS = ['high', 'low'];

// Mocked color payload the controller will receive from analyzeSkinTone.
let cannedColors;

const stub = (rel, exports) => {
  const p = require.resolve(rel);
  require.cache[p] = { id: p, filename: p, loaded: true, exports };
};
stub('../src/services/perfectCorp/skinToneAnalysis.service', { analyzeSkinTone: async () => cannedColors });
stub('../src/services/firestore.service', { saveScan: async () => 'mock-id' });

delete require.cache[require.resolve('../src/controllers/skinAnalysis.controller')];
const { analyzeSkin } = require('../src/controllers/skinAnalysis.controller');

// Invoke the controller with a fake multipart file and capture the outcome:
// either a res.json({status,data}) or a next(err).
function invoke(colors) {
  cannedColors = colors;
  return new Promise((resolve) => {
    const req = { file: { buffer: Buffer.from('x'), originalname: 'face.jpg', mimetype: 'image/jpeg' } };
    const res = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(body) { resolve({ kind: 'json', status: this._status, body }); },
    };
    const next = (err) => resolve({ kind: 'next', err });
    // Guard against a synchronous throw escaping the promise.
    Promise.resolve().then(() => analyzeSkin(req, res, next)).catch((err) => resolve({ kind: 'throw', err }));
  });
}

function assertValidSuccess(out) {
  assert.equal(out.kind, 'json', `expected a JSON response, got ${out.kind}` + (out.err ? `: ${out.err.message}` : ''));
  assert.equal(out.status, 200);
  assert.equal(out.body.status, 'success');
  const { undertone, contrast, season } = out.body.data.classification;
  assert.ok(UNDERTONES.includes(undertone), `undertone ${undertone}`);
  assert.ok(CONTRASTS.includes(contrast), `contrast ${contrast}`);
  assert.ok(SEASONS.includes(season), `season ${season}`);
  assert.ok(typeof out.body.data.recommendations.explanation === 'string');
  assert.ok(!out.body.data.recommendations.explanation.includes('undefined'));
  return out.body.data;
}

// 3a — ONLY skin_color.
test('3a: controller returns a valid result with only skin_color', async () => {
  const data = assertValidSuccess(await invoke({ skin_color: '#E0AC69' }));
  // Single feature -> no measurable spread -> low contrast.
  assert.equal(data.classification.contrast, 'low');
  assert.ok(!data.recommendations.explanation.toLowerCase().includes('hair'));
});

// 3b — skin_color + hair_color only.
test('3b: controller returns a valid result with skin_color + hair_color', async () => {
  const data = assertValidSuccess(await invoke({ skin_color: '#E0AC69', hair_color: '#3B2A1A' }));
  assert.ok(data.recommendations.explanation.toLowerCase().includes('hair'));
});

// 3d — empty-string optional field must not crash and must not appear as hair.
test('3d: empty-string optional fields do not crash the controller', async () => {
  const data = assertValidSuccess(await invoke({ skin_color: '#E0AC69', eye_color: '', hair_color: '' }));
  // hair_color "" is falsy -> treated as absent -> no "hair" wording.
  assert.ok(!data.recommendations.explanation.toLowerCase().includes('hair'));
});

// 3e — malformed hex must not crash; result stays within the valid enums.
test('3e: malformed skin_color hex does not crash (returns a valid enum result)', async () => {
  assertValidSuccess(await invoke({ skin_color: 'red' }));
});

test('3e: malformed optional hex does not crash', async () => {
  assertValidSuccess(await invoke({ skin_color: '#E0AC69', eye_color: 'not-a-hex', hair_color: 'zzz' }));
});

// 3e — a valid 6-digit hex WITHOUT a leading '#' (a plausible real-API variant)
// still classifies correctly.
test('3e: valid hex without a leading # still works', async () => {
  const data = assertValidSuccess(await invoke({ skin_color: 'E0AC69', hair_color: '3B2A1A' }));
  assert.equal(data.classification.undertone, 'warm');
});
