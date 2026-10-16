import test from 'node:test';
import assert from 'node:assert/strict';
import { getInquirySubmissionKey, isInquiryIdempotencyKey, hashInquiryRecord, persistInquiryOnce } from '../supabase/functions/submit-inquiry/idempotency.mjs';

test('unchanged draft retries with exactly the same key',()=>{
  const draft={name:'test',quantity:12};
  const first=getInquirySubmissionKey(null,draft,null);
  assert.equal(isInquiryIdempotencyKey(first.key),true);
  assert.equal(getInquirySubmissionKey(first,draft,null).key,first.key);
  assert.notEqual(getInquirySubmissionKey(first,{...draft,quantity:13},null).key,first.key);
  assert.notEqual(getInquirySubmissionKey(first,draft,'user-1').key,first.key);
});

test('hash canonical row + verified user to distinguish payload and identity',async()=>{
  const row={subject:'Test',quantity:12};
  const first=await hashInquiryRecord(row,null);
  assert.match(first,/^[a-f0-9]{64}$/);
  assert.equal(await hashInquiryRecord(row,null),first);
  assert.notEqual(await hashInquiryRecord({...row,quantity:13},null),first);
  assert.notEqual(await hashInquiryRecord(row,'verified-user'),first);
});

test('RPC success, replay and conflict preserve original inquiry ID',async()=>{
  const key=crypto.randomUUID();
  const calls=[];
  const client={rpc:async(name,args)=>{calls.push({name,args});return {data:{inquiryId:'test-inquiry-id',replayed:calls.length>1},error:null};}};
  const row={subject:'Test'};
  const first=await persistInquiryOnce(client,{key,row,userId:null});
  const second=await persistInquiryOnce(client,{key,row,userId:null});
  assert.deepEqual(first,{inquiryId:'test-inquiry-id',replayed:false,conflict:false});
  assert.deepEqual(second,{inquiryId:'test-inquiry-id',replayed:true,conflict:false});
  assert.equal(calls[0].name,'create_inquiry_idempotent');
  assert.equal(calls[0].args.p_key,key);
  assert.equal(calls[0].args.p_user_id,null);
  assert.equal(calls[0].args.p_hash,calls[1].args.p_hash);
});

test('invalid key, conflict, missing RPC and malformed success fail closed',async()=>{
  const good=crypto.randomUUID();
  const row={subject:'Test'};
  await assert.rejects(()=>persistInquiryOnce({rpc:async()=>({data:{inquiryId:'x',replayed:false}})},{key:'bad',row,userId:null}));
  const conflict=await persistInquiryOnce({rpc:async()=>({data:null,error:{code:'23505'}})},{key:good,row,userId:null});
  assert.deepEqual(conflict,{conflict:true});
  for(const response of [{data:null,error:{code:'42501'}},{data:null,error:null},{data:{inquiryId:'x'},error:null}]){
    await assert.rejects(()=>persistInquiryOnce({rpc:async()=>response},{key:good,row,userId:null}));
  }
});
