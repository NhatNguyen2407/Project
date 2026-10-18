import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePayPalItems, captureRequestId, payPalServerEnvironment, storedPayPalId } from '../supabase/functions/_shared/paypalIntegrity.mjs';
import { canUsePayPalCheckout } from '../src/app/utils/paypalEnvironment.js';

test('multi-product capture normalizes without destructuring object entries as arrays', () => {
  const cart = [{id:'B',qty:2},{id:'A',qty:1},{id:' B ',qty:3}];
  assert.deepEqual(normalizePayPalItems(cart),[{id:'A',qty:1},{id:'B',qty:5}]);
  assert.equal(cart[2].id,' B ');
});
test('create and capture canonical carts agree despite input order and split rows', () => {
  const create = normalizePayPalItems([{id:'B',qty:'2'},{id:'A',qty:'3'}],{coerceQuantities:true});
  const capture = normalizePayPalItems([{id:'A',qty:1},{id:'B',qty:2},{id:'A',qty:2}]);
  assert.deepEqual(create,capture);
});
test('invalid quantities, empty IDs and unsafe aggregated counts are rejected before PayPal', () => {
  for (const cart of [null,[],[{id:' ',qty:1}],[{id:1,qty:1}],[{id:'A',qty:'1'}],
    [{id:'A',qty:0}],[{id:'A',qty:1.5}],[{id:'A',qty:Infinity}],
    [{id:'A',qty:Number.MAX_SAFE_INTEGER},{id:'A',qty:1}]])
    assert.throws(()=>normalizePayPalItems(cart));
});
test('capture retries reuse one provider request ID, distinct orders stay distinct', async () => {
  const a=await captureRequestId('SYNTHETICORDER01');
  assert.equal(a,await captureRequestId('SYNTHETICORDER01'));
  assert.notEqual(a,await captureRequestId('SYNTHETICORDER02'));
  assert.match(a,/^cap-[a-f0-9]{32}$/);
  assert.ok(a.length<=38);
  for(const id of ['',null,'bad/id','x'.repeat(65)])await assert.rejects(()=>captureRequestId(id));
});

test('server and browser Sandbox opt-ins reject wrong project, live mode and default state', () => {
  const url='https://bvnnmvlfcduwmneipmsi.supabase.co';
  assert.equal(payPalServerEnvironment(url,'sandbox','true').base,'https://api-m.sandbox.paypal.com');
  for(const args of [[url,'live','true'],[url,'sandbox','false'],['https://xeljnocizvlmefqovvfw.supabase.co','sandbox','true'],['https://other.invalid','sandbox','true']])
    assert.throws(()=>payPalServerEnvironment(...args));
  const gate={deploymentEnvironment:'preview',supabaseUrl:url,mode:'sandbox',stagingOptIn:'true',clientId:'test-client'};
  assert.equal(canUsePayPalCheckout(gate),true);
  for(const changes of [{stagingOptIn:'false'},{mode:'live'},{supabaseUrl:'https://other.invalid'},{clientId:''},{deploymentEnvironment:'development'}])
    assert.equal(canUsePayPalCheckout({...gate,...changes}),false);
  assert.equal(storedPayPalId('TESTORDER',true),'STG-SANDBOX-TESTORDER');
  assert.equal(storedPayPalId('TESTORDER',false),'TESTORDER');
});
