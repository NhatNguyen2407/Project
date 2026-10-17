import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminInquiryReadHandler,validateAction,validSignedImageUrl } from '../supabase/functions/admin-inquiries/handler.mjs';
const origin='https://staging.example.test';
const uid='11111111-1111-4111-8111-111111111111',iid='22222222-2222-4222-8222-222222222222';
const path='guest/33333333-3333-4333-8333-333333333333.png';
const link='storage://inquiry-test-references/'+path;
const signed='https://bvnnmvlfcduwmneipmsi.supabase.co/storage/v1/object/sign/inquiry-test-references/'+path+'?token=synthetic';
const env={INQUIRY_ALLOWED_ORIGINS:origin,INQUIRY_ADMIN_READ_STAGING_ENABLED:'true',
  SUPABASE_URL:'https://bvnnmvlfcduwmneipmsi.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-secret',
  INQUIRY_PUBLIC_API_KEY:'public-key'};
function setup({change={},role='admin',user=uid,reference=link,url=signed}={}){
 const calls=[];
 const client={
  auth:{getUser:async()=>{calls.push('auth');return {data:{user:user?{id:user}:null},error:null};}},
  from:table=>{
    calls.push(table);
    if(table==='user_roles')return {select:()=>({eq:()=>({eq:()=>({limit:async()=>({data:role?[{role}]:[],error:null})})})})};
    if(table==='inquiries')return {select:fields=>fields==='image_link'
      ?{eq:()=>({maybeSingle:async()=>({data:{image_link:reference},error:null})})}
      :{order:()=>({limit:async()=>({data:[{id:iid,subject:'test'}],error:null})})}};
    throw Error('Unrecognized table');
  },
  storage:{from:bucket=>{calls.push(bucket);return {createSignedUrl:async(p,seconds)=>{
    assert.equal(p,path);assert.equal(seconds,60);calls.push('signed');return {data:{signedUrl:url},error:null};
  }}}},
 };
 const handler=createAdminInquiryReadHandler({
  envGet:key=>({...env,...change})[key],
  createClient:(project,key)=>{assert.equal(project,env.SUPABASE_URL);assert.equal(key,env.SUPABASE_SERVICE_ROLE_KEY);
    calls.push('server');return client;},logger:{error:()=>{}}
 });
 const req=(body={action:'reference',inquiryId:iid},headers={})=>new Request(origin+'/functions/v1/admin-inquiries',{
  method:'POST',headers:{origin,apikey:'public-key',authorization:'Bearer sample-user-token',
    'content-type':'application/json',...headers},body:JSON.stringify(body),
 });
 return {calls,handler,req};
}
test('accept only two read-only actions, never arbitrary paths',()=>{
 assert.deepEqual(validateAction({action:'list'}),{action:'list'});
 for(const x of [{action:'delete'},{action:'reference',inquiryId:'bad'},
  {action:'reference',inquiryId:iid,path:'private'},{action:'list',columns:'*'}])
  assert.equal(validateAction(x),null);
});
test('disabled or Production config causes no privileged calls',async()=>{
 for(const change of [{INQUIRY_ADMIN_READ_STAGING_ENABLED:undefined},
  {SUPABASE_URL:'https://xeljnocizvlmefqovvfw.supabase.co'}]){
  const f=setup({change}),r=await f.handler(f.req());
  assert.equal(r.status,503);assert.deepEqual(f.calls,[]);
 }
});
test('auth and server-side role deny guests/non-admins',async()=>{
 for(const attrs of [{user:null},{role:'customer'},{role:null}]){
  const f=setup(attrs),r=await f.handler(f.req());
  assert.ok([401,403].includes(r.status));
  assert.ok(!f.calls.includes('inquiries')&&!f.calls.includes('signed'));
 }
 const f=setup();const response=await f.handler(f.req(undefined,{authorization:'Bearer public-key'}));
 assert.equal(response.status,401);assert.deepEqual(f.calls,[]);
});
test('admin can list bounded Inquiry fields and resolve private image for 60s',async()=>{
 const f=setup(),list=await f.handler(f.req({action:'list'}));
 assert.equal(list.status,200);assert.deepEqual((await list.json()).inquiries,[{id:iid,subject:'test'}]);
 const resolved=await f.handler(f.req());
 assert.deepEqual(await resolved.json(),{success:true,url:signed,expiresIn:60});
 assert.ok(f.calls.includes('user_roles')&&f.calls.includes('inquiries')&&f.calls.includes('signed'));
});
test('reject forged URLs and nonprivate references',async()=>{
 assert.equal(validSignedImageUrl(signed,path),true);
 for(const x of [signed.replace('https://','http://'),signed.replace('sign/','public/'),
  signed.replace('token=synthetic','a=1'),signed.replace('bvnnmvlfcduwmneipmsi','xeljnocizvlmefqovvfw')])
  assert.equal(validSignedImageUrl(x,path),false);
 for(const reference of ['https://cdn.example/image.png','storage://inquiry-test-references/other/foo.png']){
  const f=setup({reference}),r=await f.handler(f.req());
  assert.equal(r.status,400);assert.ok(!f.calls.includes('signed'));
 }
 const f=setup({url:'https://example.com/wrong'}),r=await f.handler(f.req());
 assert.equal(r.status,503);
});
test('foreign origin and unexpected body cannot trigger DB queries',async()=>{
 const f=setup();
 assert.equal((await f.handler(f.req(undefined,{origin:'https://foreign.example.test'}))).status,403);
 assert.equal((await f.handler(f.req({action:'list',extra:true}))).status,400);
 assert.ok(!f.calls.includes('inquiries'));
});
