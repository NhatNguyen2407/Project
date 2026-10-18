import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canUseLiveExternalServices, PRODUCTION_SUPABASE_URL } from '../src/app/utils/externalServicePolicy.js';

test('only Production with known Production backend enables live third-party operations', () => {
  assert.equal(canUseLiveExternalServices({deploymentEnvironment:'production',supabaseUrl:PRODUCTION_SUPABASE_URL}),true);
  for(const deploymentEnvironment of [undefined,'','preview','development','production-test']) {
    for(const supabaseUrl of [PRODUCTION_SUPABASE_URL,'https://bvnnmvlfcduwmneipmsi.supabase.co',undefined]) {
      assert.equal(canUseLiveExternalServices({deploymentEnvironment,supabaseUrl}),false);
    }
  }
  assert.equal(canUseLiveExternalServices({deploymentEnvironment:'production',supabaseUrl:'https://bvnnmvlfcduwmneipmsi.supabase.co'}),false);
});

test('Checkout, Admin and Cloudinary use the environment guard before live writes', () => {
  const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
  const checkout=read('../src/app/pages/CheckoutPage.jsx');
  const admin=read('../src/app/pages/AdminPage.jsx');
  const cloud=read('../src/app/service/cloudinary.js');
  const vite=read('../vite.config.ts');
  assert.match(checkout,/allowPayPalCheckout \? <PayPalScriptProvider/);
  assert.match(checkout,/if \(liveExternalServices\) await emailjs\.send/);
  assert.match(admin,/const allowAdminWrite = \(\) => \{[\s\S]*?canUseLiveExternalServices\(/);
  assert.match(admin,/const handleUpdateStatus = async[\s\S]*?if \(!allowAdminWrite\(\)\) return;/);
  assert.match(cloud,/export const uploadImageToCloudinary = async \(file, getUploadCaptcha\) => \{[\s\S]*?selectInquiryImageProvider\(/);
  assert.match(vite,/['"]import\.meta\.env\.VITE_VERCEL_ENV['"]:\s*JSON\.stringify\(process\.env\.VERCEL_ENV \|\| ''\)/);
});
