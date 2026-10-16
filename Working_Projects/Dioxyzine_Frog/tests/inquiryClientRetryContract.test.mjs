import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('browser service sends idempotency key and retains it on uncertain failure',()=>{
  const src=readFileSync(new URL('../src/app/service/api.js',import.meta.url),'utf8');
  assert.match(src,/pendingInquiry = \{ fingerprint, key: crypto\.randomUUID\(\), promise: null \}/);
  assert.match(src,/idempotencyKey: pending\.key/);
  assert.match(src,/if \(pending\.promise\) return pending\.promise/);
  assert.match(src,/if \(pendingInquiry === pending\) pendingInquiry = null/);
  assert.match(src,/if \(!result\.replayed\)/);
});

test('trusted handler requires valid key and maps RPC replays and key conflicts',()=>{
  const src=readFileSync(new URL('../supabase/functions/submit-inquiry/handler.mjs',import.meta.url),'utf8');
  assert.match(src,/isInquiryIdempotencyKey\(body\?\.idempotencyKey\)/);
  assert.match(src,/persistInquiryOnce\(admin/);
  assert.match(src,/if \(result\.conflict\)/);
  assert.match(src,/result\.replayed \? 200 : 201/);
});
