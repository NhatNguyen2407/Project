import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uploadGuestInquiryImage } from '../src/app/utils/inquiryGuestUpload.js';

const uuid='11111111-1111-4111-8111-111111111111';
const path=`guest/${uuid}.png`;
const pngMagic=Uint8Array.of(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a);
const file=new Blob([pngMagic],{type:'image/png'});
function mock({issued={success:true,bucket:'inquiry-test-references',path,token:'fake-capability'},upload={data:{path},error:null}}={}){
 const events=[];
 const client={
   functions:{invoke:async(name,request)=>{events.push(name);assert.equal(request.body.sizeBytes,file.size);
     return {data:issued,error:null};}},
   storage:{from:bucket=>{events.push('bucket:'+bucket);return {
     uploadToSignedUrl:async(p,token,content,options)=>{
       events.push('signed-upload');assert.equal(token,'fake-capability');assert.equal(p,path);
       assert.equal(content,file);assert.equal(options.upsert,false);return upload;
     }
   }}}
 };
 return {client,events};
}
test('guest flow returns canonical Storage reference, never bearer token or expiring URL',async()=>{
 const f=mock(),captcha=async()=>{f.events.push('captcha');return 'x'.repeat(50)};
 const result=await uploadGuestInquiryImage(file,{client:f.client,getUploadCaptcha:captcha});
 assert.equal(result,'storage://inquiry-test-references/'+path);
 assert.deepEqual(f.events,['captcha','issue-inquiry-upload','bucket:inquiry-test-references','signed-upload']);
});
test('invalid MIME and bad signatures are rejected before any remote call',async()=>{
 const f=mock();
 await assert.rejects(uploadGuestInquiryImage(new Blob(['<svg>'],{type:'image/png'}),{
   client:f.client,getUploadCaptcha:async()=> 'x'.repeat(50),
 }),/Image signature mismatch/);
 await assert.rejects(uploadGuestInquiryImage(new Blob(['123'],{type:'image/svg+xml'}),{
   client:f.client,getUploadCaptcha:async()=> 'x'.repeat(50),
 }),/Only PNG/);
 assert.deepEqual(f.events,[]);
});
test('forged issuer path, wrong bucket or failed upload never returns an attached reference',async()=>{
 for(const issued of [
   {success:true,bucket:'avatars',path,token:'fake-capability'},
   {success:true,bucket:'inquiry-test-references',path:'guest/../test.png',token:'fake-capability'},
   {success:true,bucket:'inquiry-test-references',path,token:''},
 ]) await assert.rejects(uploadGuestInquiryImage(file,{
   client:mock({issued}).client,getUploadCaptcha:async()=> 'x'.repeat(50),
 }));
 await assert.rejects(uploadGuestInquiryImage(file,{
   client:mock({upload:{data:null,error:new Error('RLS failed')}}).client,
   getUploadCaptcha:async()=> 'x'.repeat(50),
 }));
});
test('production Cloudinary path cannot call the guest function until isolated provider selected',()=>{
 const code=readFileSync(new URL('../src/app/service/cloudinary.js',import.meta.url),'utf8');
 assert.match(code,/if \(!config\) throw new Error/);
 assert.match(code,/if \(config\.kind === 'supabase-storage'\) \{\s*return uploadGuestInquiryImage/);
 assert.match(code,/VITE_ENABLE_STAGING_STORAGE_UPLOAD/);
});
