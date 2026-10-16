import test from 'node:test';
import assert from 'node:assert/strict';
import { mayMirrorInquiryToSheets } from '../src/app/utils/inquiryMirrorPolicy.js';
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
