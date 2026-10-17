import test from 'node:test';
import assert from 'node:assert/strict';
import { mayMirrorInquiryToSheets, maySubmitFeedbackToSheets } from '../src/app/utils/inquiryMirrorPolicy.js';
import { readFileSync } from 'node:fs';

const production = 'https://xeljnocizvlmefqovvfw.supabase.co';
const staging = 'https://bvnnmvlfcduwmneipmsi.supabase.co';

test('Sheets mirroring fails closed without an explicit Production-only opt-in', () => {
  for (const optIn of [undefined, false, true, '', 'TRUE', 'false']) {
    assert.equal(mayMirrorInquiryToSheets({
      optIn, deploymentEnvironment: 'production', supabaseUrl: production,
    }), false);
  }
  assert.equal(mayMirrorInquiryToSheets({
    optIn: 'true', deploymentEnvironment: 'production', supabaseUrl: production,
  }), true);
});

test('Preview and local/staging can never mirror even with opt-in enabled', () => {
  for (const deploymentEnvironment of ['preview', 'development', undefined, '']) {
    for (const supabaseUrl of [production, staging]) {
      assert.equal(mayMirrorInquiryToSheets({
        optIn: 'true', deploymentEnvironment, supabaseUrl,
      }), false);
    }
  }
  assert.equal(mayMirrorInquiryToSheets({
    optIn: 'true', deploymentEnvironment: 'production', supabaseUrl: staging,
  }), false);
});

test('client checks mirror policy only after confirmed non-replayed submission', () => {
  const src = readFileSync(new URL('../src/app/service/api.js', import.meta.url), 'utf8');
  assert.match(src, /if \(!result\.replayed && mayMirrorInquiryToSheets\(\{/);
  assert.match(src, /VITE_ENABLE_INQUIRY_SHEETS_MIRROR/);
  assert.match(src, /VITE_VERCEL_ENV/);
  assert.match(src, /VITE_SUPABASE_URL/);
});

test('legacy feedback can write only from verified Production with Production backend', () => {
  assert.equal(maySubmitFeedbackToSheets({
    deploymentEnvironment: 'production', supabaseUrl: production,
  }), true);
  for (const deploymentEnvironment of ['preview', 'development', '', undefined]) {
    for (const supabaseUrl of [production, staging, undefined]) {
      assert.equal(maySubmitFeedbackToSheets({ deploymentEnvironment, supabaseUrl }), false);
    }
  }
  assert.equal(maySubmitFeedbackToSheets({
    deploymentEnvironment: 'production', supabaseUrl: staging,
  }), false);
});

test('feedback rejects non-production environments before creating a Sheets fetch request', () => {
  const src = readFileSync(new URL('../src/app/service/api.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const start = src.indexOf('submitFeedback: async (data) => {');
  const end = src.indexOf('\n  }\n};', start);
  assert.ok(start >= 0 && end > start);
  const handler = src.slice(start, end);
  const guard = handler.indexOf('if (!maySubmitFeedbackToSheets({');
  const createPayload = handler.indexOf("const payload = { type: 'feedback'");
  const sendRequest = handler.indexOf('return fetch(SCRIPT_URL');
  assert.ok(guard >= 0 && createPayload > guard && sendRequest > createPayload);
  assert.match(handler, /VITE_VERCEL_ENV/);
  assert.match(handler, /VITE_SUPABASE_URL/);
});
