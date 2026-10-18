import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPreviewBackendIsolation } from '../scripts/check-preview-backend.mjs';

const prodRef = 'xeljnocizvlmefqovvfw';
const stageRef = 'abcdefghijklmnopqrst';
const safeConfig = {
  deploymentEnvironment: 'preview',
  productionProjectRef: prodRef,
  stagingProjectRef: stageRef,
  supabaseUrl: `https://${stageRef}.supabase.co`,
};

test('explicitly approved separate staging project passes', () => {
  assert.doesNotThrow(() => assertPreviewBackendIsolation(safeConfig));
});

test('local and production builds are not changed by the guard', () => {
  for (const env of ['production', 'development', undefined, '']) {
    assert.doesNotThrow(() => assertPreviewBackendIsolation({ deploymentEnvironment: env }));
  }
});

test('missing, invalid and production-equal staging refs are blocked', () => {
  for (const stagingProjectRef of [undefined, '', 'bad', prodRef]) {
    assert.throws(() => assertPreviewBackendIsolation({ ...safeConfig, stagingProjectRef }), /Preview blocked/);
  }
});

test('preview rejects production backend even if staging marker was provided', () => {
  assert.throws(() => assertPreviewBackendIsolation({
    ...safeConfig,
    supabaseUrl: `https://${prodRef}.supabase.co`,
  }), /Preview blocked/);
});

test('preview rejects absent, unsafe, and mismatched backend URLs', () => {
  for (const supabaseUrl of [
    undefined,
    '',
    'not-a-url',
    `http://${stageRef}.supabase.co`,
    `https://${stageRef}.supabase.co.evil.example`,
    `https://${stageRef}.supabase.co:5555`,
    `https://${stageRef}.supabase.co/rest/v1`,
    `https://user:pass@${stageRef}.supabase.co`,
    `https://${stageRef}.supabase.co?test=1`,
    `https://${stageRef}.supabase.co/#fragment`,
  ]) {
    assert.throws(() => assertPreviewBackendIsolation({ ...safeConfig, supabaseUrl }), /Preview blocked/);
  }
});

test('preview rejects invalid production project marker', () => {
  assert.throws(() => assertPreviewBackendIsolation({
    ...safeConfig,
    productionProjectRef: 'invalid',
  }), /Preview safety check/);
});


test('Vite build config wires actual Vercel environment into the isolation guard', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
  assert.match(source, /import\s*\{\s*assertPreviewBackendIsolation\s*\}\s*from\s*['"]\.\/scripts\/check-preview-backend\.mjs['"]/);
  assert.match(source, /assertPreviewBackendIsolation\s*\(\s*\{/);
  assert.match(source, /deploymentEnvironment:\s*process\.env\.VERCEL_ENV/);
  assert.match(source, /supabaseUrl:\s*process\.env\.VITE_SUPABASE_URL/);
  assert.match(source, /stagingProjectRef:\s*process\.env\.STAGING_SUPABASE_REF/);
  assert.match(source, /productionProjectRef:\s*['"]xeljnocizvlmefqovvfw['"]/);
});
