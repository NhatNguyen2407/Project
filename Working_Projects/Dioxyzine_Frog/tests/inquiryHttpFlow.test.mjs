import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryHandler } from '../supabase/functions/submit-inquiry/handler.mjs';

const now = Date.parse('2026-10-16T03:00:00Z');
const captcha = { success:true, score:0.9, hostname:'shop.test.example', action:'inquiry_submit', challenge_ts:'2026-10-16T02:59:30Z' };
const inquiry = {
  subject:'Custom plush', customerName:'Test User', customerEmail:'PERSON@EXAMPLE.COM',
  contactInfo:'test channel', productName:'Plush', size:'10', quantity:'10',
  accessoryQty:'0', imageLink:'https://example.com/design.png', note:'synthetic',
  user_id:'forged', status:'completed',
};
const token = 'test-captcha-' + 'a'.repeat(60);
const env = {
  INQUIRY_ALLOWED_ORIGINS:'https://shop.test.example',
  INQUIRY_ALLOWED_HOSTNAMES:'shop.test.example',
  INQUIRY_RECAPTCHA_MIN_SCORE:'0.5', RECAPTCHA_SECRET_KEY:'synthetic-secret',
  SUPABASE_SERVICE_ROLE_KEY:'synthetic-server-key',
  SUPABASE_ANON_KEY:'synthetic-public-key',
  SUPABASE_URL:'https://test.invalid',
};
const body = { token, inquiry };
const request = (input=body, options={}) => new Request('https://test.invalid/functions/v1/submit-inquiry',{
  method:'POST',
  headers: {
    origin:options.origin ?? 'https://shop.test.example',
    'content-type':options.contentType ?? 'application/json',
    ...(options.headers||{}),
  },
  body:options.raw ?? JSON.stringify(input),
});

function fixture(options={}) {
  const events=[], records=[], errors=[], usedTokens=new Set();
  const client = {
    rpc:async (_name, args)=>{
      events.push(args.p_scope);
      if(options.rpcError===args.p_scope) return {data:null,error:{code:'TEST_DB_ERROR'}};
      return {data:options.denyBudget===args.p_scope?false:true,error:null};
    },
    auth:{getUser:async bearer=>{
      events.push('auth');
      return bearer==='valid-test-user'
        ? {data:{user:{id:'verified-user'}},error:null}
        : {data:{user:null},error:new Error('invalid')};
    }},
    from:table=>{
      assert.equal(table,'inquiries');
      return {insert:row=>{
        events.push('insert');records.push(row);
        return {select:fields=>{
          assert.equal(fields,'id');
          return {single:async ()=>options.insertError
            ? {data:null,error:{code:'TEST_STORAGE_ERROR'}}
            : {data:{id:'created-test-inquiry'},error:null}};
        }};
      }};
    },
  };
  const handler = createInquiryHandler({
    envGet:key=>({...env,...options.env})[key],
    createClient:()=>{events.push('client');return client;},
    fetchCaptcha:async (_url, requestOptions)=>{
      events.push('google');
      if(options.networkError) throw Error('network unavailable');
      if(options.googleHttpError) return {ok:false,status:503};
      const value=new URLSearchParams(requestOptions.body).get('response');
      if(options.rejectReplayedToken&&usedTokens.has(value)) return {ok:true,json:async()=>({success:false})};
      usedTokens.add(value);
      return {ok:true,json:async()=>({...captcha,...options.captcha})};
    },
    clock:()=>now,
    logger:{error:(...args)=>errors.push(args)},
  });
  return {handler,events,records,errors};
}
async function check(handler, req, status) {
  const response=await handler(req);
  assert.equal(response.status,status);
  return {response, body: status===204?null:await response.json()};
}

test('guest submission validates CAPTCHA, both budgets, and writes allowlisted fields once',async()=>{
  const f=fixture();
  const {body:result,response}=await check(f.handler,request(),201);
  assert.equal(result.success,true);
  assert.equal(result.inquiryId,'created-test-inquiry');
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.deepEqual(f.events,['client','inquiry-preverify','google','inquiry-accepted','insert']);
  assert.equal(f.records.length,1);
  assert.equal(f.records[0].user_id,null);
  assert.equal(f.records[0].status,undefined);
  assert.equal(f.records[0].customer_email,'person@example.com');
  assert.equal(f.records[0].quantity,10);
});
test('signed-in user is resolved using Auth, never caller-supplied user_id',async()=>{
  const f=fixture();
  await check(f.handler,request(body,{headers:{authorization:'Bearer valid-test-user'}}),201);
  assert.equal(f.records[0].user_id,'verified-user');
  assert.ok(f.events.includes('auth'));
});
test('public anon token remains a guest and cannot impersonate user',async()=>{
  const f=fixture();
  await check(f.handler,request(body,{headers:{authorization:'Bearer synthetic-public-key'}}),201);
  assert.equal(f.records[0].user_id,null);
  assert.equal(f.events.includes('auth'),false);
});
test('invalid bearer and malformed auth deny insert instead of silently falling back to guest',async()=>{
  for(const auth of ['Bearer expired-test-user','Basic unsafe']){
    const f=fixture();
    await check(f.handler,request(body,{headers:{authorization:auth}}),401);
    assert.equal(f.records.length,0);
  }
});
test('unknown origin fails before any external IO and approved preflight is handled',async()=>{
  const f=fixture();
  const {response}=await check(f.handler,request(body,{origin:'https://evil.example'}),403);
  assert.equal(response.headers.get('access-control-allow-origin'),null);
  assert.deepEqual(f.events,[]);
  const preflight=new Request('https://test.invalid/functions/v1/submit-inquiry',{
    method:'OPTIONS',headers:{origin:'https://shop.test.example','access-control-request-method':'POST'},
  });
  await check(f.handler,preflight,204);
  assert.deepEqual(f.events,[]);
});
test('bad token, invalid email, wrong JSON and oversized JSON fail before write',async()=>{
  for(const [input,options,status] of [
    [{...body,token:'short'}, {},400],
    [{...body,inquiry:{...inquiry,customerEmail:'invalid'}},{},400],
    [null,{raw:'{invalid-json'},400],
    [body,{contentType:'text/plain'},415],
    [body,{raw:JSON.stringify({...body,padding:'x'.repeat(17000)})},413],
  ]){
    const f=fixture();
    await check(f.handler,request(input,options),status);
    assert.equal(f.events.includes('insert'),false);
  }
});
test('preverify exceeded fails without calling Google or writing',async()=>{
  const f=fixture({denyBudget:'inquiry-preverify'});
  await check(f.handler,request(),429);
  assert.equal(f.events.includes('google'),false);
  assert.equal(f.records.length,0);
});
test('accepted quota exceeded fails after Google, before write',async()=>{
  const f=fixture({denyBudget:'inquiry-accepted'});
  await check(f.handler,request(),429);
  assert.equal(f.events.includes('google'),true);
  assert.equal(f.records.length,0);
});
test('RPC unavailable fails closed at both points',async()=>{
  for(const scope of ['inquiry-preverify','inquiry-accepted']){
    const f=fixture({rpcError:scope});
    await check(f.handler,request(),503);
    assert.equal(f.records.length,0);
  }
});
test('wrong CAPTCHA action, hostname, score, freshness and success cannot insert',async()=>{
  for(const invalid of [
    {action:'login'},{hostname:'evil.example'},{score:0.1},
    {challenge_ts:'2026-10-16T02:54:00Z'},{success:false},
  ]){
    const f=fixture({captcha:invalid});
    await check(f.handler,request(),403);
    assert.equal(f.events.includes('inquiry-accepted'),false);
    assert.equal(f.records.length,0);
  }
});
test('Google error or network loss fails without writing',async()=>{
  for(const opt of [{googleHttpError:true},{networkError:true}]){
    const f=fixture(opt);
    await check(f.handler,request(),503);
    assert.equal(f.records.length,0);
  }
});
test('storage error does not pretend success or disclose customer details',async()=>{
  const f=fixture({insertError:true});
  const {body:result}=await check(f.handler,request(),503);
  assert.equal(result.success,false);
  assert.doesNotMatch(JSON.stringify({result,logs:f.errors}),/PERSON@EXAMPLE.COM|test-captcha-/);
});
test('CAPTCHA replay marked invalid by provider does not duplicate data',async()=>{
  const f=fixture({rejectReplayedToken:true});
  await check(f.handler,request(),201);
  await check(f.handler,request(),403);
  assert.equal(f.records.length,1);
});
test('missing secret/hostname configuration fails closed',async()=>{
  for(const key of ['RECAPTCHA_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY','INQUIRY_ALLOWED_HOSTNAMES']){
    const f=fixture({env:{[key]:''}});
    await check(f.handler,request(),503);
    assert.deepEqual(f.events,[]);
  }
});
test('unapproved HTTP methods fail without side effects',async()=>{
  const f=fixture();
  await check(f.handler,new Request('https://test.invalid/functions/v1/submit-inquiry',{
    method:'GET',headers:{origin:'https://shop.test.example'},
  }),405);
  assert.deepEqual(f.events,[]);
});
