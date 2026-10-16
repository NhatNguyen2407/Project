import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInquiryFormGate } from '../src/app/utils/inquiryFormGate.js';

test('duplicate synchronous submits are rejected before React rerender', () => {
  const gate=createInquiryFormGate();
  assert.equal(gate.beginSubmit(),true);
  assert.equal(gate.beginSubmit(),false);
  assert.equal(gate.beginUpload(),null);
  assert.equal(gate.isBusy(),true);
  assert.equal(gate.finishSubmit(),true);
  assert.equal(gate.isBusy(),false);
  assert.equal(gate.beginSubmit(),true);
});

test('submission is blocked until the latest image upload completes', () => {
  const gate=createInquiryFormGate();
  const first=gate.beginUpload();
  assert.equal(gate.beginSubmit(),false);
  const second=gate.beginUpload();
  assert.equal(gate.isCurrentUpload(first),false);
  assert.equal(gate.finishUpload(first),false);
  assert.equal(gate.isCurrentUpload(second),true);
  assert.equal(gate.beginSubmit(),false);
  assert.equal(gate.finishUpload(second),true);
  assert.equal(gate.beginSubmit(),true);
});

test('upload replacement always invalidates the earlier asynchronous response', () => {
  const gate=createInquiryFormGate();
  const first=gate.beginUpload();
  const second=gate.beginUpload();
  assert.equal(gate.isCurrentUpload(first),false);
  assert.equal(gate.isCurrentUpload(second),true);
  assert.equal(gate.finishUpload(first),false);
  assert.equal(gate.isBusy(),true);
  assert.equal(gate.finishUpload(second),true);
  assert.equal(gate.isCurrentUpload(second),false);
});

test('Inquiry UI clears prior URL and checks latest upload before rendering success', () => {
  const src=readFileSync(new URL('../src/app/pages/InquiryPage.jsx',import.meta.url),'utf8');
  const upload=src.slice(src.indexOf('const handleImageUpload = async'),src.indexOf('const handleSubmit = async'));
  const clear=upload.indexOf("imageLink: ''");
  const awaitUpload=upload.indexOf('await uploadImageToCloudinary(');
  const current=upload.indexOf('isCurrentUpload(attempt)');
  const attach=upload.indexOf('imageLink: uploadedUrl');
  assert.ok(clear>=0 && awaitUpload>clear && current>awaitUpload && attach>current);
  assert.match(upload,/finishUpload\(attempt\)/);
  assert.match(src,/disabled=\{isUploading \|\| status === 'loading'\}/);
});

test('Inquiry UI synchronously gates network submission and releases on completion', () => {
  const src=readFileSync(new URL('../src/app/pages/InquiryPage.jsx',import.meta.url),'utf8');
  const sub=src.slice(src.indexOf('const handleSubmit = async'),src.indexOf('\n  return (',src.indexOf('const handleSubmit = async')));
  assert.match(sub,/if \(formGateRef\.current\.isBusy\(\)\) return/);
  const lock=sub.indexOf('beginSubmit()');
  const request=sub.indexOf('await api.submitInquiry(');
  assert.ok(lock>=0 && request>lock);
  assert.match(sub,/finally \{\s*formGateRef\.current\.finishSubmit\(\)/);
});
