import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdminReviewRows, requireAdminReviewTable } from '../src/app/utils/adminReviewRecords.js';
const canonical={id:'review-1',rating:5,product_names:['Sample Plush','Custom Doll'],created_at:'2026-10-16T14:00:00Z'};
const mirror={id:'inquiry-mirror',order_review_id:'review-1',rating:5,product_name:'Sample Plush',created_at:'2026-10-16T14:01:00Z'};
const old={id:'legacy-1',rating:4,product_name:'Old Plush',created_at:'2026-10-16T13:00:00Z'};
test('mirror deduplicates against canonical source',()=>{
 const rows=buildAdminReviewRows([mirror,old],[canonical]);
 assert.deepEqual(rows.map(x=>x.id),['review-1','legacy-1']);
 assert.equal(rows[0].sourceTable,'order_reviews');
 assert.equal(rows[1].sourceTable,'inquiries');
 assert.equal(rows[0].display_product_name,'Sample Plush, Custom Doll');
});
test('orphaned legacy mirror remains visible while canonical source is inaccessible',()=>{
 const rows=buildAdminReviewRows([mirror],[]);
 assert.equal(rows.length,1);
 assert.equal(rows[0].sourceTable,'inquiries');
});
test('non-reviews are never displayed',()=>{
 assert.deepEqual(buildAdminReviewRows([null,{id:'x',rating:null},{id:'y',rating:8}], [{id:'z',rating:0}]),[]);
});
test('merge does not mutate input order, handles missing data and blank titles',()=>{
 const entries=[old,mirror];
 const rows=buildAdminReviewRows(entries,[canonical]);
 assert.deepEqual(entries,[old,mirror]);
 assert.deepEqual(buildAdminReviewRows(null,null),[]);
 assert.equal(buildAdminReviewRows([],[{...canonical,product_names:['',null]}])[0].display_product_name,'Product Review');
 assert.equal(rows.length,2);
});
test('only explicit source tables and IDs may be used for Admin mutations',()=>{
 assert.equal(requireAdminReviewTable({id:'a',sourceTable:'inquiries'}),'inquiries');
 assert.equal(requireAdminReviewTable({id:'b',sourceTable:'order_reviews'}),'order_reviews');
 for(const value of [null,{}, {id:'',sourceTable:'inquiries'},{id:'a',sourceTable:'orders'}]) assert.throws(()=>requireAdminReviewTable(value));
});
