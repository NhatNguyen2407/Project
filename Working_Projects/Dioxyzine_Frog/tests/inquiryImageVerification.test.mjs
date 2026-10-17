import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createStagingImageVerifier, IMAGE_MAX_BYTES, assertStillImageContainer } from '../supabase/functions/submit-inquiry/imageVerification.mjs';
import { imageBytes } from '../scripts/fixtures/inquiryImages.mjs';
import { persistInquiryOnce } from '../supabase/functions/submit-inquiry/idempotency.mjs';
import { validateInquiryPayload,SubmissionValidationError } from '../supabase/functions/submit-inquiry/validation.mjs';

const path='guest/11111111-1111-4111-8111-111111111111.png';
const row={image_link:`storage://inquiry-test-references/${path}`};
const bytes=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
const etag=createHash('md5').update(bytes).digest('hex');
const challenge={path,mimeType:'image/png',sizeBytes:bytes.length,etag};
const headers={'content-type':'image/png',etag:`"${etag}"`};
function fixture(options={}) {
 const calls=[];
 const verify=createStagingImageVerifier({supabaseUrl:options.url??'https://bvnnmvlfcduwmneipmsi.supabase.co',
  serviceRoleKey:'synthetic-server-key',
  fetchObject:async(url,request)=>{calls.push({kind:'fetch',url,request});return options.response?.()??new Response(bytes,{headers});},
  decodeImage:async(value,mimeType)=>{calls.push({kind:'decode'});assert.deepEqual(value,bytes);return options.decoded??{mimeType,width:2,height:2};},
 });
 return {verify,calls};
}
test('server downloads only the scoped object and returns byte-bound decoded evidence',async()=>{
 const f=fixture(),proof=await f.verify(row,challenge);
 assert.equal(proof.etag,etag);assert.equal(proof.sizeBytes,bytes.length);
 assert.equal(proof.sha256,createHash('sha256').update(bytes).digest('hex'));
 assert.deepEqual(f.calls.map(c=>c.kind),['fetch','decode']);
 assert.equal(f.calls[0].url,`https://bvnnmvlfcduwmneipmsi.supabase.co/storage/v1/object/authenticated/inquiry-test-references/${path}`);
 assert.equal(f.calls[0].request.redirect,'error');
 assert.equal(f.calls[0].request.headers['If-Match'],`"${etag}"`);
});
test('malformed challenges, paths and Production are rejected before any IO',async()=>{
 for(const changed of [{path:'../other'},{mimeType:'image/jpeg'},{etag:null},{etag:'W/"'+etag+'"'},
   {sizeBytes:IMAGE_MAX_BYTES+1},{sizeBytes:0},{sizeBytes:2.5}]) {
  const f=fixture();await assert.rejects(()=>f.verify(row,{...challenge,...changed}));assert.deepEqual(f.calls,[]);
 }
 const f=fixture({url:'https://xeljnocizvlmefqovvfw.supabase.co'});
 await assert.rejects(()=>f.verify(row,challenge));assert.deepEqual(f.calls,[]);
});
test('response header, checksum, MIME, size and signature mismatch cannot reach decoder',async()=>{
 const variants=[
  ()=>new Response(bytes,{headers:{...headers,etag:'"'+'b'.repeat(32)+'"'}}),
  ()=>new Response(bytes,{headers:{...headers,'content-type':'text/html'}}),
  ()=>new Response(bytes,{headers:{...headers,'content-length':'999'}}),
  ()=>new Response(bytes.slice(1),{headers}),
  ()=>new Response(new Uint8Array(bytes.length+1),{headers}),
  ()=>new Response(new Uint8Array(bytes.length),{headers}),
  ()=>new Response(bytes,{status:206,headers}),
 ];
 for(const response of variants) {
  const f=fixture({response});await assert.rejects(()=>f.verify(row,challenge),SubmissionValidationError);
  assert.equal(f.calls.some(c=>c.kind==='decode'),false);
 }
});
test('oversized chunked streams are cancelled immediately, without buffering the whole response',async()=>{
 let cancelled=false;
 const f=fixture({response:()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(bytes.length+1));},cancel(){cancelled=true;}}),{headers})});
 await assert.rejects(()=>f.verify(row,challenge),SubmissionValidationError);
 assert.equal(cancelled,true);
});
test('invalid decoded dimensions or format are rejected',async()=>{
 for(const decoded of [{mimeType:'image/jpeg',width:2,height:2},{mimeType:'image/png',width:2049,height:2},
  {mimeType:'image/png',width:0,height:2},{mimeType:'image/png',width:2,height:NaN}]) {
  await assert.rejects(()=>fixture({decoded}).verify(row,challenge),SubmissionValidationError);
 }
});
test('missing or changed objects are invalid input; storage outages remain service errors',async()=>{
 for(const status of [404,412,500,401]) {
  const f=fixture({response:()=>new Response(null,{status})});
  await assert.rejects(()=>f.verify(row,challenge),error=>(error instanceof SubmissionValidationError)===[404,412].includes(status));
 }
});
test('verified submission uses two calls, one stable hash, and a separate fail-closed RPC',async()=>{
 const calls=[],key=crypto.randomUUID();
 const client={rpc:async(name,args)=>{calls.push({name,args});return {data:calls.length===1?{verificationRequired:challenge}:{inquiryId:'saved',replayed:false},error:null};}};
 const f=fixture();
 await persistInquiryOnce(client,{key,row,userId:null,requireImageVerification:true,verifyImage:f.verify});
 assert.equal(calls.length,2);assert.ok(calls.every(c=>c.name==='create_verified_inquiry_idempotent'));
 assert.equal(calls[0].args.p_hash,calls[1].args.p_hash);
 assert.equal(calls[0].args.p_row._verified_image,undefined);
 assert.equal(calls[1].args.p_row._verified_image.etag,etag);
 assert.equal(row._verified_image,undefined);
});
test('committed replay and key conflict never download/decode; failed verification never finalizes',async()=>{
 for(const response of [{data:{inquiryId:'saved',replayed:true}},{error:{code:'23505'}}]) {
  await persistInquiryOnce({rpc:async()=>response},{key:crypto.randomUUID(),row,userId:null,requireImageVerification:true,
   verifyImage:()=>assert.fail('must not reverify')});
 }
 let calls=0;
 await assert.rejects(()=>persistInquiryOnce({rpc:async()=>{calls++;return {data:{verificationRequired:challenge}};}},
  {key:crypto.randomUUID(),row,userId:null,requireImageVerification:true,verifyImage:()=>{throw new SubmissionValidationError('bad');}}));
 assert.equal(calls,1);
});
test('old backend/missing verifier cannot fall back to an unverified insert',async()=>{
 const names=[];
 await assert.rejects(()=>persistInquiryOnce({rpc:async name=>{names.push(name);return {error:{code:'PGRST202'}};}},
  {key:crypto.randomUUID(),row,userId:null,requireImageVerification:true}));
 assert.deepEqual(names,['create_verified_inquiry_idempotent']);
 await assert.rejects(()=>persistInquiryOnce({rpc:async()=>({data:{verificationRequired:challenge}})},
  {key:crypto.randomUUID(),row,userId:null,requireImageVerification:true}));
});
test('browser-supplied verification evidence is discarded by the HTTP input allowlist',()=>{
 const validated=validateInquiryPayload({subject:'Test',customerName:'Synthetic',customerEmail:'test@example.invalid',contactInfo:'Test',
  productName:'Toy',quantity:1,imageLink:row.image_link,_verified_image:{etag,sha256:'a'.repeat(64)}},{stagingPrivateImages:true});
 assert.equal(validated._verified_image,undefined);
});

test('animated PNG/WebP and inconsistent chunk lengths are rejected before decoding',()=>{
 const png=imageBytes('image/png'),webp=imageBytes('image/webp');
 assert.doesNotThrow(()=>assertStillImageContainer(png,'image/png'));
 assert.doesNotThrow(()=>assertStillImageContainer(webp,'image/webp'));
 // Replace a chunk type with animation control; the container check rejects
 // it independently of the decoder's CRC validation.
 const apng=png.slice();apng.set(new TextEncoder().encode('acTL'),12);
 assert.throws(()=>assertStillImageContainer(apng,'image/png'),SubmissionValidationError);
 const animatedWebp=webp.slice();animatedWebp.set(new TextEncoder().encode('ANIM'),12);
 assert.throws(()=>assertStillImageContainer(animatedWebp,'image/webp'),SubmissionValidationError);
 const badLength=png.slice();new DataView(badLength.buffer).setUint32(8,0xffffffff);
 assert.throws(()=>assertStillImageContainer(badLength,'image/png'),SubmissionValidationError);
 assert.throws(()=>assertStillImageContainer(webp.subarray(0,webp.length-1),'image/webp'),SubmissionValidationError);
});
