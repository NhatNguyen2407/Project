import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyInquiryCaller, isAllowedInquiryPreflight } from '../supabase/functions/submit-inquiry/requestAuth.mjs';
const headers=fields=>new Headers(fields);
const publicKey='sb_publishable_synthetic';
const serverKey='synthetic-service-secret';

test('API key header must match approved public key before accepting user credentials',()=>{
  assert.equal(classifyInquiryCaller(headers({}),publicKey,serverKey).status,401);
  assert.equal(classifyInquiryCaller(headers({apikey:'unknown'}),publicKey,serverKey).status,401);
  assert.equal(classifyInquiryCaller(headers({apikey:serverKey}),publicKey,serverKey).status,401);
  assert.deepEqual(classifyInquiryCaller(headers({apikey:publicKey}),publicKey,serverKey),{status:200,userToken:null});
});
test('legacy and publishable API keys are not user JWTs',()=>{
  assert.deepEqual(classifyInquiryCaller(headers({apikey:publicKey,authorization:'Bearer '+publicKey}),publicKey,serverKey),{status:200,userToken:null});
  assert.deepEqual(classifyInquiryCaller(headers({apikey:'legacy-anon',authorization:'Bearer legacy-anon'}),'legacy-anon',serverKey),{status:200,userToken:null});
});
test('valid-looking user bearer still requires auth.getUser in the handler',()=>{
  assert.deepEqual(classifyInquiryCaller(headers({apikey:publicKey,authorization:'Bearer synthetic-user-jwt'}),publicKey,serverKey),{status:200,userToken:'synthetic-user-jwt'});
});
test('secret and mismatched publishable bearer values fail closed',()=>{
  for(const value of [serverKey,'sb_secret_forbidden','sb_publishable_different']){
    assert.equal(classifyInquiryCaller(headers({apikey:publicKey,authorization:'Bearer '+value}),publicKey,serverKey).status,401);
  }
  assert.equal(classifyInquiryCaller(headers({apikey:publicKey,authorization:'Basic test'}),publicKey,serverKey).status,401);
});
test('misconfigured public key fails closed',()=>{
  for(const value of [undefined,'',serverKey,'sb_secret_forbidden']){
    assert.equal(classifyInquiryCaller(headers({apikey:publicKey}),value,serverKey).status,503);
  }
});
test('preflight header allowlist is case-insensitive and rejects unexpected headers or methods',()=>{
  const allowed='authorization, apikey, content-type, x-client-info';
  assert.equal(isAllowedInquiryPreflight({headers:headers({'access-control-request-method':'POST','access-control-request-headers':'Authorization,APiKey,X-Client-Info,Content-Type'})},allowed),true);
  assert.equal(isAllowedInquiryPreflight({headers:headers({'access-control-request-method':'DELETE','access-control-request-headers':'apikey'})},allowed),false);
  assert.equal(isAllowedInquiryPreflight({headers:headers({'access-control-request-method':'POST','access-control-request-headers':'x-private-token'})},allowed),false);
});
test('function configuration remains scoped and CORS headers follow pinned Supabase SDK',()=>{
  const config=readFileSync(new URL('../supabase/config.toml',import.meta.url),'utf8');
  const index=readFileSync(new URL('../supabase/functions/submit-inquiry/index.ts',import.meta.url),'utf8');
  assert.match(config,/\[functions\.submit-inquiry\][\s\S]*?verify_jwt\s*=\s*false/);
  assert.match(index,/supabase-js@2\.110\.0\/cors/);
  assert.match(index,/allowedCorsHeaders:\s*corsHeaders\['Access-Control-Allow-Headers'\]/);
});
