import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectInquiryImageProvider, STAGING_BUCKET, STAGING_URL, PRODUCTION_URL, validSignedStagingImageUrl } from '../src/app/utils/inquiryImageProvider.js';
import { uploadSyntheticInquiryImage, hasExpectedImageSignature } from '../src/app/utils/inquiryStorageUpload.js';

const prod={deploymentEnvironment:'production',supabaseUrl:PRODUCTION_URL,productionCloudName:'prod-cloud',productionPreset:'prod-preset'};
const stage={...prod,deploymentEnvironment:'preview',supabaseUrl:STAGING_URL,stagingStorageOptIn:'true'};
const uid='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const path=`${uid}/${id}.png`;
const signed=`${STAGING_URL}/storage/v1/object/sign/${STAGING_BUCKET}/${path}?token=synthetic-test-token`;
const pngMagic = Uint8Array.of(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a);
const jpegMagic = Uint8Array.of(0xff,0xd8,0xff,0xe0);
const webpMagic = Uint8Array.of(0x52,0x49,0x46,0x46,0x01,0x02,0x03,0x04,0x57,0x45,0x42,0x50);
const file=new Blob([pngMagic],{type:'image/png'});
function fakeClient({userId=uid,uploadError=null,signError=null,uploadedPath=path,signedUrl=signed}={}) {
  const events=[];
  const client={
    auth:{getUser:async()=>{events.push('identity');return {data:{user:userId?{id:userId}:null},error:null};}},
    storage:{from:bucket=>{events.push('bucket:'+bucket);return {
      upload:async(p,f,opts)=>{events.push('upload:'+p);assert.equal(opts.upsert,false);return {data:{path:uploadedPath},error:uploadError};},
      createSignedUrl:async(p,secs)=>{events.push('sign:'+p);assert.equal(secs,3600);return {data:{signedUrl},error:signError};}
    }}},
  };
  return {client,events};
}
test('Production still selects Cloudinary; Preview Staging selects private Storage only with explicit opt-in',()=>{
  assert.deepEqual(selectInquiryImageProvider(prod),{kind:'cloudinary',cloudName:'prod-cloud',preset:'prod-preset'});
  assert.deepEqual(selectInquiryImageProvider(stage),{kind:'supabase-storage',bucket:STAGING_BUCKET});
  for(const patch of [{stagingStorageOptIn:undefined},{stagingStorageOptIn:'false'},{deploymentEnvironment:'development'},{supabaseUrl:PRODUCTION_URL},{deploymentEnvironment:'production'}]){
    assert.equal(selectInquiryImageProvider({...stage,...patch}),null);
  }
});
test('Staging signed URL only accepts exact bucket, path, host and token',()=>{
  assert.equal(validSignedStagingImageUrl(signed,path),true);
  for(const url of [
    signed.replace('https:','http:'),signed.replace('bvnnmvlfcduwmneipmsi','xeljnocizvlmefqovvfw'),
    signed.replace('sign/','public/'),signed.replace('token=synthetic-test-token','other=1'),
    signed.replace('/inquiry-test-references/','/avatars/'),
    signed.replace('/'+path,'/'+uid+'/wrong.png')
  ]) assert.equal(validSignedStagingImageUrl(url,path),false);
});
test('signed-in synthetic upload returns a private one-hour signed URL with no overwrites',async()=>{
  const {client,events}=fakeClient();
  assert.equal(await uploadSyntheticInquiryImage(file,{client,createId:()=>id}),signed);
  assert.deepEqual(events,['identity','bucket:'+STAGING_BUCKET,'upload:'+path,'sign:'+path]);
});
test('guest users and invalid image formats fail before upload',async()=>{
  const f=fakeClient({userId:null});
  await assert.rejects(uploadSyntheticInquiryImage(file,{client:f.client,createId:()=>id}),/Sign in/);
  assert.deepEqual(f.events,['identity']);
  for(const bad of [{type:'image/svg+xml',size:20},{type:'image/png',size:6*1024*1024},{type:'image/png',size:0}]) {
    await assert.rejects(uploadSyntheticInquiryImage(bad,{client:f.client,createId:()=>id}),/Only JPG/);
  }
});
test('failed, forged or unconfirmed upload result never yields an image URL',async()=>{
  for(const options of [{uploadedPath:'other.png'},{signedUrl:'https://res.cloudinary.com/prod-cloud/image/upload/a.jpg'},{uploadError:new Error('storage RLS denied')},{signError:new Error('sign denied')}]) {
    const {client}=fakeClient(options);
    await assert.rejects(uploadSyntheticInquiryImage(file,{client,createId:()=>id}));
  }
});
test('image service gates provider selection before contacting Cloudinary or Staging',()=>{
  const source=readFileSync(new URL('../src/app/service/cloudinary.js',import.meta.url),'utf8');
  assert.match(source,/const config = selectInquiryImageProvider\(/);
  assert.match(source,/if \(!config\) throw new Error/);
  assert.match(source,/VITE_ENABLE_STAGING_STORAGE_UPLOAD/);
  assert.match(source,/return uploadGuestInquiryImage\(file, \{client:supabase, getUploadCaptcha\}\)/);
  assert.match(source,/if \(config.kind === 'supabase-storage'\)/);
  assert.match(source,/config\.cloudName/);
});
test('Staging SQL defaults to private bucket, owner-only RLS, no anon policies',()=>{
  const sql=readFileSync(new URL('../docs/staging/STAGING_INQUIRY_STORAGE.sql',import.meta.url),'utf8');
  assert.match(sql,/STAGING ONLY/);
  assert.match(sql,/storage\.buckets[\s\S]*false,5242880/);
  assert.match(sql,/for insert to authenticated/);
  assert.match(sql,/for select to authenticated/);
  assert.doesNotMatch(sql,/for insert to anon/);
  assert.doesNotMatch(sql,/for insert to public/);
  assert.match(sql,/auth\.uid\(\)/);
});

test('client rejects mislabeled image bytes before contacting Auth or Storage', async () => {
  const {client,events}=fakeClient();
  const fakePng=new Blob([Uint8Array.of(0x3c,0x73,0x76,0x67)],{type:'image/png'});
  await assert.rejects(uploadSyntheticInquiryImage(fakePng,{client,createId:()=>id}),/Image bytes do not match/);
  assert.deepEqual(events,[]);
});

test('recognized PNG, JPEG and WebP magic bytes match only their MIME types',()=>{
  assert.equal(hasExpectedImageSignature(pngMagic,'image/png'),true);
  assert.equal(hasExpectedImageSignature(jpegMagic,'image/jpeg'),true);
  assert.equal(hasExpectedImageSignature(webpMagic,'image/webp'),true);
  assert.equal(hasExpectedImageSignature(pngMagic,'image/jpeg'),false);
  assert.equal(hasExpectedImageSignature(jpegMagic,'image/png'),false);
  assert.equal(hasExpectedImageSignature(webpMagic.slice(0,11),'image/webp'),false);
  assert.equal(hasExpectedImageSignature(new Uint8Array(),'image/png'),false);
  assert.equal(hasExpectedImageSignature(webpMagic,'image/svg+xml'),false);
  assert.equal(hasExpectedImageSignature(null,'image/png'),false);
});
