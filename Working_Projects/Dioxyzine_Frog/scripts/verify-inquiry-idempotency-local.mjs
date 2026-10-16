import { spawnSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parseLocalRateTestDatabase } from './verify-inquiry-rate-limit-local.mjs';

const env = parseLocalRateTestDatabase(process.env.INQUIRY_LOCAL_DATABASE_URL, process.env.INQUIRY_RATE_TEST_ACK);
const runtime = {PATH:process.env.PATH||'', HOME:process.env.HOME||'', LANG:'C', ...env};
function sql(query, expectedFailure=false) {
  const result = spawnSync('psql',['-X','-A','-t','-q','-v','ON_ERROR_STOP=1','-c',query],{env:runtime,encoding:'utf8'});
  if (!expectedFailure && result.status !== 0) throw Error('Disposable PostgreSQL test query failed');
  return {status:result.status,value:result.stdout.trim()};
}
function file(path) {
  const result = spawnSync('psql',['-X','-A','-t','-q','-v','ON_ERROR_STOP=1','-f',path],{env:runtime,encoding:'utf8'});
  assert.equal(result.status,0,'SQL draft must apply to disposable PostgreSQL');
}
const marker=process.env.INQUIRY_RATE_TEST_RUN_MARKER;
assert.match(marker||'',/^[a-zA-Z0-9_-]{16,120}$/);
assert.equal(sql("select current_database()||'|'||(select marker from public.inquiry_ci_disposable_marker limit 1)").value,
  'dioxyzine_rate_limit_test|'+marker);
sql('create table public.inquiries (id uuid primary key default gen_random_uuid(), subject text, customer_name text, customer_email text, contact_info text, product_name text, size text, quantity integer, accessory_qty integer, image_link text, note text, user_id uuid)');
file('docs/drafts/INQUIRY_IDEMPOTENCY_DRAFT.sql');
for(const role of ['anon','authenticated'])
  assert.equal(sql("select has_function_privilege('"+role+"','public.create_inquiry_idempotent(uuid,text,jsonb,uuid)','execute')").value,'f');
const key=randomUUID(), hash=createHash('sha256').update('synthetic').digest('hex');
const row=JSON.stringify({subject:'Test',customer_name:'Synthetic',customer_email:'sample@example.invalid',contact_info:'Test',product_name:'Plush',size:'10',quantity:2,accessory_qty:0,image_link:'https://example.invalid/sample'});
const statement="select public.create_inquiry_idempotent('"+key+"','"+hash+"','"+row+"'::jsonb,null)::text";
const results=[];
for(let i=0;i<3;i++)results.push(JSON.parse(sql(statement).value));
assert.equal(results.filter(r=>r.replayed===false).length,1);
assert.equal(results.filter(r=>r.replayed===true).length,2);
assert.equal(new Set(results.map(r=>r.inquiryId)).size,1);
assert.equal(sql('select count(*) from public.inquiries').value,'1');
assert.notEqual(sql("select public.create_inquiry_idempotent('"+key+"','"+ 'b'.repeat(64) +"','"+row+"'::jsonb,null)",true).status,0);
assert.equal(sql('select count(*) from public.inquiries').value,'1');
assert.notEqual(sql("begin; set local role anon; "+statement+"; rollback;",true).status,0);
console.log('Idempotency SQL test succeeded: same-key replays=2, inserts=1, conflict denied, anon denied');
