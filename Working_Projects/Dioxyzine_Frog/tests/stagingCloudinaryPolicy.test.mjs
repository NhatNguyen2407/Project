import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectCloudinaryUploadConfig, isStagingUploadResponseValid, STAGING_CLOUDINARY_FOLDER } from '../src/app/utils/stagingCloudinaryPolicy.js';

const config={deploymentEnvironment:'preview',supabaseUrl:'https://bvnnmvlfcduwmneipmsi.supabase.co',productionCloudName:'prod-cloud',productionPreset:'prod-preset',stagingCloudName:'other-cloud',stagingPreset:'staging-only',previewOptIn:'true'};
test('preview requires explicit isolated cloud AND preset plus opt-in',()=>{
  assert.deepEqual(selectCloudinaryUploadConfig(config),{cloudName:'other-cloud',preset:'staging-only',staging:true});
  for(const changes of [{previewOptIn:undefined},{previewOptIn:'false'},{stagingCloudName:'prod-cloud'},{stagingPreset:'prod-preset'},{deploymentEnvironment:'development'},{supabaseUrl:'https://xeljnocizvlmefqovvfw.supabase.co'},{stagingCloudName:''},{stagingPreset:''}])
    assert.equal(selectCloudinaryUploadConfig({...config,...changes}),null);
});
test('production upload remains supported and cannot accidentally route to staging',()=>{
  assert.deepEqual(selectCloudinaryUploadConfig({...config,deploymentEnvironment:'production',supabaseUrl:'https://xeljnocizvlmefqovvfw.supabase.co'}),{cloudName:'prod-cloud',preset:'prod-preset',staging:false});
  assert.equal(selectCloudinaryUploadConfig({...config,deploymentEnvironment:'production'}),null);
});
test('staging upload response requires HTTPS and intended prefix',()=>{
  const data={public_id:STAGING_CLOUDINARY_FOLDER+'/synthetic-photo',secure_url:'https://res.cloudinary.com/other-cloud/image/upload/v123/synthetic-photo.jpg'};
  assert.equal(isStagingUploadResponseValid(data,'other-cloud'),true);
  for(const change of [{public_id:'User_Uploads/synthetic-photo'},{secure_url:'http://res.cloudinary.com/other-cloud/image/upload/a.jpg'},{secure_url:'https://evil.example.com/other-cloud/image/upload/a.jpg'},{secure_url:'https://res.cloudinary.com/prod-cloud/image/upload/a.jpg'}])
    assert.equal(isStagingUploadResponseValid({...data,...change},'other-cloud'),false);
});
test('Cloudinary service uses gated configuration before POST',()=>{
  const source=readFileSync(new URL('../src/app/service/cloudinary.js',import.meta.url),'utf8');
  assert.match(source,/const config = selectCloudinaryUploadConfig\(/);
  assert.match(source,/if \(!config\) throw new Error/);
  assert.match(source,/VITE_ENABLE_STAGING_CLOUDINARY_UPLOAD/);
  assert.match(source,/isStagingUploadResponseValid\(data, config\.cloudName\)/);
});
