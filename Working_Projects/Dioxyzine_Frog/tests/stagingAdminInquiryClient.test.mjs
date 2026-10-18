import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  STAGING_ADMIN_SUPABASE_URL,isStagingAdminInquiryEnabled,
  isPrivateInquiryReference,isAuthorizedStagingReferenceUrl,
  loadStagingAdminInquiries,openStagingAdminReference,
} from '../src/app/utils/stagingAdminInquiryClient.js';

const gate={environment:'preview',supabaseUrl:STAGING_ADMIN_SUPABASE_URL,optIn:'true'};
const id='22222222-2222-4222-8222-222222222222';
const ref='storage://inquiry-test-references/guest/11111111-1111-4111-8111-111111111111.png';
const link=STAGING_ADMIN_SUPABASE_URL+'/storage/v1/object/sign/inquiry-test-references/guest/11111111-1111-4111-8111-111111111111.png?token=test-token';
const row={id,image_link:ref};

test('client is off by default; never selects Production or unknown backend',()=>{
  for(const patch of [
    {optIn:undefined},{optIn:'false'},{environment:'development'},
    {environment:'production'},{supabaseUrl:'https://xeljnocizvlmefqovvfw.supabase.co'},
  ]) assert.equal(isStagingAdminInquiryEnabled({...gate,...patch}),false);
  assert.equal(isStagingAdminInquiryEnabled(gate),true);
});

test('private references and short-lived URLs must match exact object path',()=>{
  assert.equal(isPrivateInquiryReference(ref),true);
  assert.equal(isAuthorizedStagingReferenceUrl(link,ref),true);
  for(const input of [
    'storage://inquiry-test-references/other/11111111-1111-4111-8111-111111111111.png',
    'https://example.com/test.png',
    'storage://inquiry-test-references/guest/../private.png',
  ]) assert.equal(isPrivateInquiryReference(input),false);
  for(const invalid of [
    link.replace('https://','http://'),
    link.replace('bvnnmvlfcduwmneipmsi','xeljnocizvlmefqovvfw'),
    link.replace('sign/','public/'),
    link.replace('token=test-token','other=test'),
    link.replace('11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333'),
    link+'&download=true',
  ]) assert.equal(isAuthorizedStagingReferenceUrl(invalid,ref),false);
});

test('disabled gate makes zero network calls',async()=>{
  let called=0;
  const client={functions:{invoke:async()=>{called++;return {data:{success:true}};}}};
  await assert.rejects(loadStagingAdminInquiries(client,{...gate,optIn:'false'}));
  await assert.rejects(openStagingAdminReference(client,{...gate,optIn:'false'},row));
  assert.equal(called,0);
});

test('read-only list uses exactly one Edge call and fails closed on invalid reply',async()=>{
  const events=[];
  const client={functions:{invoke:async(name,arg)=>{
    events.push({name,body:arg.body});
    return {data:{success:true,inquiries:[row]},error:null};
  }}};
  assert.deepEqual(await loadStagingAdminInquiries(client,gate),[row]);
  assert.deepEqual(events,[{name:'admin-inquiries',body:{action:'list'}}]);
  await assert.rejects(loadStagingAdminInquiries({functions:{invoke:async()=>({
    data:{success:true,inquiries:Array(101).fill(row)},error:null
  })}},gate));
  await assert.rejects(loadStagingAdminInquiries({functions:{invoke:async()=>({
    data:{success:false,inquiries:[row]},error:null
  })}},gate));
});

test('private reference is requested by Inquiry ID only, never client storage path',async()=>{
  const events=[];
  const client={functions:{invoke:async(name,request)=>{
    events.push([name,request.body]);return {data:{success:true,url:link,expiresIn:60},error:null};
  }}};
  assert.equal(await openStagingAdminReference(client,gate,row),link);
  assert.deepEqual(events,[['admin-inquiries',{action:'reference',inquiryId:id}]]);
  await assert.rejects(openStagingAdminReference(client,gate,{...row,image_link:'https://example.com/x.png'}));
  assert.equal(events.length,1);
  const badClient={functions:{invoke:async()=>({data:{success:true,url:'https://example.com/picture.png',expiresIn:60},error:null})}};
  await assert.rejects(openStagingAdminReference(badClient,gate,row));
});

test('Admin UI refuses direct Preview Inquiry SELECT and does not render private references as raw links',()=>{
  const source=readFileSync(new URL('../src/app/pages/AdminPage.jsx',import.meta.url),'utf8');
  assert.match(source,/isStagingAdminInquiryEnabled/);
  assert.match(source,/loadStagingAdminInquiries\(supabase, adminInquiryGate\)/);
  assert.match(source,/openStagingAdminReference\(supabase, adminInquiryGate, inquiry\)/);
  assert.match(source,/canUseLiveExternalServices\(\{/);
  assert.match(source,/isPrivateInquiryReference\(inquiry.image_link\)/);
  assert.match(source,/Private reference/);
  assert.match(source,/VITE_ENABLE_STAGING_ADMIN_INQUIRIES/);
  assert.match(source,/setTimeout\(\(\) => setPrivateReference\(null\)/);
});
