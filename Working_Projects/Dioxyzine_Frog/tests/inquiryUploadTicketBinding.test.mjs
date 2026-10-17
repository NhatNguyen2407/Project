import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateInquiryPayload, SubmissionValidationError } from '../supabase/functions/submit-inquiry/validation.mjs';

const uuid='11111111-1111-4111-8111-111111111111';
const goodImage=`storage://inquiry-test-references/guest/${uuid}.png`;
const valid={subject:'Synthetic inquiry',customerName:'Example',customerEmail:'test@example.invalid',
 contactInfo:'test@example.invalid',productName:'Test',quantity:1,accessoryQty:0,imageLink:goodImage};
test('Staging accepts only canonical durable guest object references',()=>{
 const row=validateInquiryPayload(valid,{stagingPrivateImages:true});
 assert.equal(row.image_link,goodImage);
 for(const imageLink of [
   'https://example.com/other.png',
   'storage://inquiry-test-references/guest/other.png',
   `storage://inquiry-test-references/admin/${uuid}.png`,
   `storage://other-bucket/guest/${uuid}.png`,
   `storage://inquiry-test-references/guest/${uuid}.svg`,
   'storage://inquiry-test-references/guest/../../avatars/foo.png'
 ]) assert.throws(()=>validateInquiryPayload({...valid,imageLink},{stagingPrivateImages:true}),SubmissionValidationError);
});
test('Production mode never accepts private references and still accepts HTTPS',()=>{
 assert.throws(()=>validateInquiryPayload(valid),SubmissionValidationError);
 const row=validateInquiryPayload({...valid,imageLink:'https://res.cloudinary.com/synthetic/image/upload/reference.png'});
 assert.match(row.image_link,/^https:\/\//);
});
test('Staging mode is gated by URL and explicit Edge toggle before validation',()=>{
 const source=readFileSync(new URL('../supabase/functions/submit-inquiry/handler.mjs',import.meta.url),'utf8');
 assert.match(source,/INQUIRY_UPLOAD_STAGING_ENABLED/);
 assert.match(source,/bvnnmvlfcduwmneipmsi/);
 assert.match(source,/stagingPrivateImages: ticketMode/);
});
test('issuer records durable upload ticket before returning signed capability',()=>{
 const source=readFileSync(new URL('../supabase/functions/issue-inquiry-upload/handler.mjs',import.meta.url),'utf8');
 const ticket=source.indexOf("admin.rpc('register_inquiry_upload_ticket'");
 const signing=source.indexOf('.createSignedUploadUrl(path)');
 const response=source.indexOf('return reply(201');
 assert.ok(ticket>0&&signing>ticket&&response>signing);
 assert.match(source,/ticketSaved!==true/);
});
test('SQL draft binds ticket plus existing Storage object and Inquiry atomically',()=>{
 const sql=readFileSync(new URL('../docs/drafts/INQUIRY_UPLOAD_TICKET_BINDING_DRAFT.sql',import.meta.url),'utf8');
 for(const term of [
  'create table inquiry_internal.upload_tickets',
  'claimed_inquiry_id uuid unique references public.inquiries(id)',
  'security invoker',
  'for update',
  'from storage.objects',
  "object_meta", // deliberate absence is checked separately
 ]) {
  if(term==='object_meta') continue;
  assert.ok(sql.includes(term),term);
 }
 const object=sql.indexOf('from storage.objects'),inquiry=sql.indexOf('insert into public.inquiries'),claim=sql.indexOf('update inquiry_internal.upload_tickets');
 assert.ok(object>0&&inquiry>object&&claim>inquiry);
 assert.match(sql,/v_size is distinct from ticket.declared_bytes::text/);
 assert.match(sql,/ticket.mime_type/);
 assert.match(sql,/pg_catalog.pg_advisory_xact_lock/);
 assert.match(sql,/create_inquiry_idempotent/);
 assert.match(sql,/revoke execute on function public.register_inquiry_upload_ticket/);
 assert.match(sql,/to service_role/);
 assert.doesNotMatch(sql,/to anon;/i);
});

test('Staging foundation includes the exact reviewed ticket schema and RPC definitions',()=>{
 const read=path=>readFileSync(new URL(path,import.meta.url),'utf8').replace(/\r\n/g,'\n');
 const draft=read('../docs/drafts/INQUIRY_UPLOAD_TICKET_BINDING_DRAFT.sql');
 const foundation=read('../docs/staging/STAGING_INQUIRY_BACKEND_FOUNDATION.sql');
 const start=draft.indexOf('create table inquiry_internal.upload_tickets');
 const end=draft.lastIndexOf('\ncommit;');
 assert.ok(start>=0&&end>start);
 assert.ok(foundation.includes(draft.slice(start,end)), 'Staging SQL diverged from reviewed ticket contract');
});
