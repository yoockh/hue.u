const test = require('node:test');
const assert = require('node:assert/strict');

// Audit hardening — service boundary (analyzeSkinTone). Proves how the real
// service treats partial / empty / missing PerfectCorp color responses. Each
// test file runs in its own process under `node --test`, so the require.cache
// stubs below do not leak into other files.

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
  return require('../src/services/perfectCorp/skinToneAnalysis.service').analyzeSkinTone;
}

const run = (analyzeSkinTone) => analyzeSkinTone(Buffer.from('x'), 'face.jpg', 'image/jpeg');
const pollWith = (color, extra = {}) => () => ({ data: { results: { color, ...extra } } });

// 3a — ONLY skin_color present, every other field absent.
test('3a: response with only skin_color resolves (no other fields required)', async () => {
  const analyzeSkinTone = loadServiceWithPollResult(pollWith({ skin_color: '#E0AC69' }));
  const result = await run(analyzeSkinTone);
  assert.equal(result.skin_color, '#E0AC69');
  assert.equal(result.hair_color, undefined);
  assert.equal(result.eye_color, undefined);
  assert.equal(result.eyebrow_color, undefined);
  assert.equal(result.lip_color, undefined);
});

// 3c (kept alongside 3a/3d for a complete boundary picture) — skin_color absent.
test('3c: response without skin_color throws a clear 502', async () => {
  const analyzeSkinTone = loadServiceWithPollResult(pollWith({ hair_color: '#3B2A1A', eye_color: '#5A4632' }));
  await assert.rejects(run(analyzeSkinTone), (err) => {
    assert.equal(err.statusCode, 502);
    assert.equal(err.code, 'incomplete_color_analysis');
    assert.match(err.message, /skin_color/);
    // The message lists what the API actually returned, for diagnosis from logs.
    assert.match(err.message, /hair_color/);
    return true;
  });
});

// 3d — empty-string skin_color is caught by the guard (not just "missing").
test('3d: empty-string skin_color throws 502 (guard catches "" not just undefined)', async () => {
  const analyzeSkinTone = loadServiceWithPollResult(pollWith({ skin_color: '' }));
  await assert.rejects(run(analyzeSkinTone), (err) => {
    assert.equal(err.statusCode, 502);
    assert.equal(err.code, 'incomplete_color_analysis');
    return true;
  });
});

// 3d — whitespace-only skin_color is also caught (trim() === '').
test('3d: whitespace-only skin_color throws 502', async () => {
  const analyzeSkinTone = loadServiceWithPollResult(pollWith({ skin_color: '   ' }));
  await assert.rejects(run(analyzeSkinTone), (err) => err.statusCode === 502);
});

// 3d — an empty-string OPTIONAL field is allowed through (it is not required);
// downstream code treats "" as absent.
test('3d: empty-string optional field passes through when skin_color is valid', async () => {
  const analyzeSkinTone = loadServiceWithPollResult(pollWith({ skin_color: '#E0AC69', eye_color: '', hair_color: '' }));
  const result = await run(analyzeSkinTone);
  assert.equal(result.skin_color, '#E0AC69');
  assert.equal(result.eye_color, '');
  assert.equal(result.hair_color, '');
});
