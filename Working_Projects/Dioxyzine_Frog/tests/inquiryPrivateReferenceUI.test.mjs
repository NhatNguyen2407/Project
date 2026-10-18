import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Inquiry uses a separate upload CAPTCHA only when provider requests it',()=>{
 const src=readFileSync(new URL('../src/app/pages/InquiryPage.jsx',import.meta.url),'utf8');
 assert.match(src,/uploadImageToCloudinary\(\s*file, \(\) => executeRecaptcha\?\.\('inquiry_upload'\)/);
});
test('form never renders private storage identifiers as clickable browser URLs',()=>{
 const src=readFileSync(new URL('../src/app/pages/InquiryPage.jsx',import.meta.url),'utf8');
 assert.match(src,/formData\.imageLink\.startsWith\('https:\/\/'\)/);
 assert.match(src,/Private Staging reference attached/);
});
