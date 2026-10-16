import test from 'node:test';
import assert from 'node:assert/strict';
import { createGuestUploadHandler, validateGuestUploadRequest, STAGING_PROJECT_URL, STAGING_IMAGE_BUCKET } from '../supabase/functions/issue-inquiry-upload/handler.mjs';
import { assessRecaptcha } from '../supabase/functions/submit-inquiry/validation.mjs';

const origin='https://staging-dioxyzine.example.test';
const path='guest/11111111-1111-4111-8111-111111111111.png';
const now=Date.parse('2026-10-16T10:00:00Z');
const env={
 INQUIRY_ALLOWED_ORIGINS:origin,INQUIRY_ALLOWED_HOSTNAMES:'staging-dioxyzine.example.test',
 SUPABASE_URL:STAGING_PROJECT_URL,SUPABASE_SERVICE_ROLE_KEY:'server-only-key',
 INQUIRY_PUBLIC_API_KEY:'public-test-key',RECAPTCHA_SECRET_KEY:'captcha-server-secret',
 INQUIRY_RECAPTCHA_MIN_SCORE:'0.5',INQUIRY_UPLOAD_STAGING_ENABLED:'true',
};
function fixture({changes={},budgetResults=[true,true],captchaAction='inquiry_upload',token='single-upload-token',ticketResult=true,ticketError=null}={}) {
 let calls=[];let grants=[...budgetResults];
 const client={
   rpc:async(name,args)=>{
     if(name==='register_inquiry_upload_ticket'){
       calls.push({kind:'ticket',path:args.p_path,mime:args.p_mime_type,bytes:args.p_declared_bytes});
       return {data:ticketResult,error:ticketError};
     }
     calls.push({kind:'budget',name,scope:args.p_scope});
     return {data:grants.shift(),error:null};
   },
   storage:{from:bucket=>{calls.push({kind:'bucket',bucket});return {createSignedUploadUrl:async p=>{
     calls.push({kind:'signed',path:p});return {data:{path:p,token},error:null};
   }}}},
 };
 const handler=createGuestUploadHandler({
   envGet:k=>({...env,...changes})[k],
   createClient:(url,key)=>{calls.push({kind:'admin',url});assert.equal(key,env.SUPABASE_SERVICE_ROLE_KEY);return client;},
   fetchCaptcha:async(_url,args)=>{calls.push({kind:'captcha',body:args.body});return {ok:true,json:async()=>({success:true,action:captchaAction,hostname:'staging-dioxyzine.example.test',score:0.95,challenge_ts:new Date(now).toISOString()})};},
   newId:()=> '11111111-1111-4111-8111-111111111111',
   clock:()=>now,logger:{error:()=>{}},
 });
 const req=(data={captchaToken:'A'.repeat(22),mimeType:'image/png',sizeBytes:1200},headers={})=>
   new Request(origin+'/functions/v1/issue-inquiry-upload',{method:'POST',
     headers:{origin,apikey:'public-test-key','content-type':'application/json',...headers},
     body:JSON.stringify(data)});
 return {handler,req,calls};
}
test('metadata allowlist and upper bound fail closed',()=>{
 assert.equal(validateGuestUploadRequest({captchaToken:'a'.repeat(22),mimeType:'image/png',sizeBytes:1})?.extension,'png');
 for(const input of [null,[],{}, {captchaToken:'x',mimeType:'image/png',sizeBytes:1},
  {captchaToken:'a'.repeat(22),mimeType:'image/svg+xml',sizeBytes:1},
  {captchaToken:'a'.repeat(22),mimeType:'image/png',sizeBytes:5242881},
  {captchaToken:'a'.repeat(22),mimeType:'image/png',sizeBytes:0},
  {captchaToken:'a'.repeat(22),mimeType:'image/png',sizeBytes:5,objectPath:'other/users/private.png'}]) {
   assert.equal(validateGuestUploadRequest(input),null);
 }
});
test('only Staging opt-in can issue a path; default and Production block before service client',async()=>{
 for(const changes of [{INQUIRY_UPLOAD_STAGING_ENABLED:undefined},{SUPABASE_URL:'https://xeljnocizvlmefqovvfw.supabase.co'},{RECAPTCHA_SECRET_KEY:''}]) {
   const f=fixture({changes});
   const r=await f.handler(f.req());
   assert.equal(r.status,503);assert.deepEqual(f.calls,[]);
 }
});
test('approved guest gets a single scoped token after two database budgets and upload CAPTCHA',async()=>{
 const f=fixture();
 const r=await f.handler(f.req());assert.equal(r.status,201);
 const result=await r.json();
 assert.deepEqual(result,{success:true,bucket:STAGING_IMAGE_BUCKET,path,token:'single-upload-token'});
 assert.deepEqual(f.calls.map(c=>c.kind),['admin','budget','captcha','budget','ticket','bucket','signed']);
 assert.deepEqual(f.calls.filter(c=>c.kind==='budget').map(c=>c.scope),['upload-preverify','upload-issued']);
 assert.ok(f.calls.find(c=>c.kind==='captcha').body.includes('response='));
});
test('invalid origin, wrong caller key, wrong method and wrong content type fail closed',async()=>{
 const f=fixture();
 const invalid=[new Request(origin+'/upload',{method:'POST',headers:{origin:'https://bad.test',apikey:'public-test-key','content-type':'application/json'},body:'{}'}),
   f.req(undefined,{apikey:'other-key'}),f.req(undefined,{'content-type':'text/plain'}),
   new Request(origin+'/upload',{method:'GET',headers:{origin}})];
 for(const req of invalid){const r=await f.handler(req);assert.notEqual(r.status,201);}
 assert.deepEqual(f.calls,[]);
});
test('CAPTCHA action mismatch, expiry and quota reject before signed URL',async()=>{
 for(const config of [{captchaAction:'inquiry_submit'},{budgetResults:[false]},{budgetResults:[true,false]}]){
   const f=fixture(config);const res=await f.handler(f.req());
   assert.ok([403,429].includes(res.status));assert.ok(!f.calls.some(c=>c.kind==='signed'));
 }
 const good={success:true,action:'inquiry_upload',hostname:'staging-dioxyzine.example.test',score:0.9,challenge_ts:new Date(now).toISOString()};
 assert.equal(assessRecaptcha(good,{allowedHostnames:['staging-dioxyzine.example.test'],now,action:'inquiry_upload'}),true);
 assert.equal(assessRecaptcha(good,{allowedHostnames:['staging-dioxyzine.example.test'],now}),false);
});
test('issuer never accepts arbitrary client object paths or credentials',async()=>{
 const f=fixture();const response=await f.handler(f.req({captchaToken:'A'.repeat(22),mimeType:'image/png',sizeBytes:1200,path:'orders/any.jpg'}));
 assert.equal(response.status,400);assert.equal(f.calls.length,0);
});
test('oversized body is rejected before calling Supabase',async()=>{
 const f=fixture();const response=await f.handler(f.req({captchaToken:'A'.repeat(22),mimeType:'image/png',sizeBytes:1200,padding:'z'.repeat(3000)}));
 assert.notEqual(response.status,201);assert.equal(f.calls.length,0);
});
test('safe preflight permits only declared request headers',async()=>{
 const f=fixture();
 const res=await f.handler(new Request(origin+'/upload',{method:'OPTIONS',headers:{
 origin,'access-control-request-method':'POST','access-control-request-headers':'apikey,content-type',
 }}));
 assert.equal(res.status,204);assert.deepEqual(f.calls,[]);
 const denied=await f.handler(new Request(origin+'/upload',{method:'OPTIONS',headers:{
 origin,'access-control-request-method':'DELETE','access-control-request-headers':'apikey',
 }}));
 assert.equal(denied.status,403);
});

test('failed ticket registration stops before signing any guest upload capability',async()=>{
 for(const config of [{ticketResult:false},{ticketResult:null},{ticketError:{code:'42501'}}]){
   const f=fixture(config), response=await f.handler(f.req());
   assert.equal(response.status,503);
   assert.equal(f.calls.some(c=>c.kind==='signed'),false);
   assert.equal(f.calls.filter(c=>c.kind==='ticket').length,1);
 }
});
