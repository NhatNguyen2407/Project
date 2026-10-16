import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INQUIRY_BUDGETS,
  consumeInquiryBudget,
} from '../supabase/functions/submit-inquiry/rateBudget.mjs';

test('budget sizes are finite, bounded, and separate for verification vs accepted submissions', () => {
  assert.deepEqual(INQUIRY_BUDGETS.preverify, {
    scope: 'inquiry-preverify',
    maxHits: 180,
    windowSeconds: 60,
  });
  assert.deepEqual(INQUIRY_BUDGETS.accepted, {
    scope: 'inquiry-accepted',
    maxHits: 60,
    windowSeconds: 3600,
  });
  assert.notEqual(INQUIRY_BUDGETS.preverify.scope, INQUIRY_BUDGETS.accepted.scope);
});

test('an allowed request executes exactly one RPC with server-selected quota', async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: true, error: null };
  }};
  assert.equal(await consumeInquiryBudget(client, INQUIRY_BUDGETS.preverify), true);
  assert.deepEqual(calls, [{
    name: 'consume_inquiry_rate_budget',
    args: { p_scope: 'inquiry-preverify', p_max_hits: 180, p_window_seconds: 60 },
  }]);
});

test('exceeded budget is rejected without silently allowing continuation', async () => {
  const client = { rpc: async () => ({ data: false, error: null }) };
  assert.equal(await consumeInquiryBudget(client, INQUIRY_BUDGETS.accepted), false);
});

test('RPC denial, service failures and unexpected responses fail closed', async () => {
  for (const response of [
    { data: null, error: new Error('permission denied') },
    { data: undefined, error: null },
    { data: 1, error: null },
    { data: 'true', error: null },
  ]) {
    const client = { rpc: async () => response };
    await assert.rejects(() => consumeInquiryBudget(client, INQUIRY_BUDGETS.preverify));
  }
  await assert.rejects(() => consumeInquiryBudget({ rpc: () => { throw Error('DB unavailable'); } }, INQUIRY_BUDGETS.accepted));
  await assert.rejects(() => consumeInquiryBudget({}, INQUIRY_BUDGETS.accepted));
  await assert.rejects(() => consumeInquiryBudget({ rpc: async () => ({ data: true }) }, { scope: 'untrusted', maxHits: 9999, windowSeconds: 1 }));
});

test('endpoint invokes preverification budget before Google and accepted budget before DB insert', () => {
  const src = readFileSync(new URL('../supabase/functions/submit-inquiry/handler.mjs', import.meta.url), 'utf8');
  const pre = src.indexOf('consumeInquiryBudget(admin, INQUIRY_BUDGETS.preverify)');
  const verify = src.indexOf("fetch('https://www.google.com/recaptcha/api/siteverify'");
  const accepted = src.indexOf('consumeInquiryBudget(admin, INQUIRY_BUDGETS.accepted)');
  const insert = src.indexOf(".from('inquiries')");
  assert.ok(pre > -1 && verify > pre && accepted > verify && insert > accepted);
  assert.match(src, /if \(!preverifyAllowed\)[\s\S]*?429/);
  assert.match(src, /if \(!acceptedAllowed\)[\s\S]*?429/);
});

test('SQL draft uses atomic upsert, fixed scope rows, revokes public RPC execution', () => {
  const sql = readFileSync(new URL('../docs/drafts/INQUIRY_RATE_LIMIT_DRAFT.sql', import.meta.url), 'utf8');
  assert.match(sql, /on conflict \(scope\) do update/i);
  assert.match(sql, /returning request_count into v_count/i);
  assert.match(sql, /scope in \('inquiry-preverify', 'inquiry-accepted'\)/i);
  assert.match(sql, /security invoker/i);
  assert.match(sql, /revoke execute on function public\.consume_inquiry_rate_budget/i);
  assert.match(sql, /grant execute on function public\.consume_inquiry_rate_budget\(text, integer, integer\)\s+to service_role/i);
  assert.match(sql, /revoke all on schema inquiry_internal from public, anon, authenticated/i);
});
