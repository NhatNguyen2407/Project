// Local/CI only: real HTTP handlers, WASM decoder and PostgreSQL transaction.
// CAPTCHA, Auth and Storage transport are synthetic test doubles. No hosted API.
import { createHash } from 'node:crypto';
import { createInquiryHandler } from '../supabase/functions/submit-inquiry/handler.mjs';
import { createGuestUploadHandler } from '../supabase/functions/issue-inquiry-upload/handler.mjs';
import { createAdminInquiryReadHandler } from '../supabase/functions/admin-inquiries/handler.mjs';
import { createStagingImageVerifier } from '../supabase/functions/submit-inquiry/imageVerification.mjs';
import { decodeReferenceImage } from '../supabase/functions/submit-inquiry/imageDecoder.mjs';
import { imageBytes } from './fixtures/inquiryImages.mjs';

const assert=(condition,message)=>{if(!condition)throw Error(message);};
const literal=value=>value==null?'null':"'"+String(value).replaceAll("'","''")+"'";
const database='inquiry_upload_disposable';
const container=Deno.env.get('INQUIRY_DISPOSABLE_CONTAINER');
assert(Deno.env.get('INQUIRY_CONTENT_TEST_ACK')==='synthetic-only','Explicit synthetic-only acknowledgement required');
let command,args;
if(container) {
 assert(/^dioxyzine-ticket-test-[a-f0-9]{32}$/.test(container),'Invalid disposable container');
 const result=await new Deno.Command('docker',{args:['inspect',container],stdout:'piped',stderr:'piped'}).output();
 assert(result.success,'Disposable container missing');
 const state=JSON.parse(new TextDecoder().decode(result.stdout))[0];
 assert(state.HostConfig.NetworkMode==='none'&&Object.keys(state.HostConfig.PortBindings??{}).length===0&&
  state.Config.Labels['dioxyzine.purpose']==='synthetic-ticket-test','Container isolation guard failed');
 command='docker';args=['exec','-i',container,'psql','-U','postgres','-d',database];
} else {
 assert(Deno.env.get('PGHOST')==='127.0.0.1'&&Deno.env.get('PGPORT')==='54324'&&
  Deno.env.get('PGDATABASE')===database,'Refusing non-disposable PostgreSQL connection');
 command='psql';args=[];
}
async function query(sql,role=null) {
 const child=new Deno.Command(command,{args:[...args,'-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate','-f','-'],
  stdin:'piped',stdout:'piped',stderr:'piped'}).spawn();
 const writer=child.stdin.getWriter();
 await writer.write(new TextEncoder().encode((role?'SET ROLE service_role;\n':'')+sql));await writer.close();
 const result=await child.output(),output=new TextDecoder().decode(result.stdout).trim();
 if(!result.success) {const e=Error('Disposable SQL failed');e.code=new TextDecoder().decode(result.stderr).match(/ERROR:\s+([A-Z0-9]{5})/)?.[1];throw e;}
 return output?JSON.parse(output):null;
}
assert(await query('select to_json(current_database());')===database,'Database identity mismatch');
assert(await query("select to_json(count(*)=1) from public.products where id='STG-SAMPLE-PLUSH';"),'Synthetic fixture missing');
assert(await query('select to_json(count(*)=0) from auth.users;'),'Expected empty synthetic Auth table');

let replaceBeforeCommit=false;
const rpc=async(name,p)=>{
 try {
  let sql;
  if(name==='consume_inquiry_rate_budget') sql=`select to_json(public.consume_inquiry_rate_budget(${literal(p.p_scope)},${Number(p.p_max_hits)},${Number(p.p_window_seconds)}));`;
  else if(name==='register_inquiry_upload_ticket') sql=`select to_json(public.register_inquiry_upload_ticket(${literal(p.p_path)},${literal(p.p_mime_type)},${Number(p.p_declared_bytes)}));`;
  else if(name==='create_verified_inquiry_idempotent') {
   if(replaceBeforeCommit&&p.p_row._verified_image) {
    replaceBeforeCommit=false;
    await query(`update storage.objects set metadata=jsonb_set(metadata,'{eTag}','"${'b'.repeat(32)}"'::jsonb) where name=${literal(p.p_row.image_link.split('inquiry-test-references/')[1])};`);
   }
   sql=`select public.create_verified_inquiry_idempotent(${literal(p.p_key)}::uuid,${literal(p.p_hash)},${literal(JSON.stringify(p.p_row))}::jsonb,${literal(p.p_user_id)}::uuid);`;
  } else throw Error('Unexpected RPC in synthetic test');
  return {data:await query(sql,true),error:null};
 } catch(error) {return {data:null,error:{code:error.code??'TEST_ERROR'}};}
};
const adminId='11111111-1111-4111-8111-111111111110',memberId='11111111-1111-4111-8111-111111111119';
await query(`alter table public.inquiries add column created_at timestamptz default now(), add column status text default 'pending';
 create table public.user_roles(user_id uuid,role text); insert into public.user_roles values('${adminId}','admin');
 grant select on public.user_roles to service_role;`);
const images=new Map(),uploadTokens=new Map(),viewTokens=new Map(),usedCaptcha=new Set();
let clock=Date.now(),downloadCount=0,base;
const staging='https://bvnnmvlfcduwmneipmsi.supabase.co',bucket='inquiry-test-references',origin='https://synthetic.example.test';
const serverKey='synthetic-server-key',publicKey='synthetic-public-key';
const client={rpc,
 auth:{getUser:async token=>({data:{user:token==='synthetic-admin'?{id:adminId}:token==='synthetic-member'?{id:memberId}:null},error:null})},
 storage:{from:name=>{assert(name===bucket,'Unexpected bucket');return {
  createSignedUploadUrl:async(path,options)=>{assert(options?.upsert===false,'Upload must not overwrite');const token=crypto.randomUUID();uploadTokens.set(token,path);return {data:{path,token},error:null};},
  createSignedUrl:async(path,seconds)=>{const token=crypto.randomUUID();viewTokens.set(token,{path,expires:clock+seconds*1000});return {data:{signedUrl:`${staging}/storage/v1/object/sign/${bucket}/${path}?token=${token}`},error:null};},
 };}},
 from:table=>{
  assert(['inquiries','user_roles'].includes(table),'Unexpected table');let columns,conditions=[],limit=100,single=false;
  const builder={select:value=>{assert(/^[a-z_,]+$/.test(value),'Unsafe columns');columns=value;return builder;},
   eq:(key,value)=>{assert(['id','user_id','role'].includes(key),'Unsafe filter');conditions.push(`${key}=${literal(value)}`);return builder;},
   order:()=>builder,limit:value=>{assert(value>=1&&value<=100,'Unsafe limit');limit=value;return builder;},
   maybeSingle:()=>{single=true;return builder;},
   then:(resolve,reject)=>query(`select coalesce(json_agg(result),'[]'::json) from (select ${columns} from public.${table}${conditions.length?' where '+conditions.join(' and '):''} limit ${limit}) result;`,true)
    .then(data=>({data:single?data[0]??null:data,error:null})).then(resolve,reject),
  };return builder;
 },
};
const env={SUPABASE_URL:staging,SUPABASE_SERVICE_ROLE_KEY:serverKey,INQUIRY_PUBLIC_API_KEY:publicKey,
 RECAPTCHA_SECRET_KEY:'synthetic-secret',INQUIRY_ALLOWED_ORIGINS:origin,INQUIRY_ALLOWED_HOSTNAMES:'synthetic.example.test',
 INQUIRY_UPLOAD_STAGING_ENABLED:'true',INQUIRY_ADMIN_READ_STAGING_ENABLED:'true'};
const fetchCaptcha=async(_url,options)=>{
 const token=new URLSearchParams(options.body).get('response'),reused=usedCaptcha.has(token);usedCaptcha.add(token);
 return {ok:true,json:async()=>({success:!reused,score:0.95,hostname:'synthetic.example.test',
  action:token.split(':')[0],challenge_ts:new Date(clock).toISOString()})};
};
const dependencies={envGet:key=>env[key],createClient:()=>client,fetchCaptcha,clock:()=>clock};
const verifyImage=createStagingImageVerifier({supabaseUrl:staging,serviceRoleKey:serverKey,decodeImage:decodeReferenceImage,
 fetchObject:(url,options)=>{assert(url.startsWith(staging+'/storage/v1/object/authenticated/'),'Unexpected image target');return fetch(base+url.slice(staging.length),options);}});
const handlers={'/functions/v1/issue-inquiry-upload':createGuestUploadHandler(dependencies),
 '/functions/v1/submit-inquiry':createInquiryHandler({...dependencies,verifyImage}),
 '/functions/v1/admin-inquiries':createAdminInquiryReadHandler(dependencies)};
const server=Deno.serve({hostname:'127.0.0.1',port:0,onListen:()=>{}},async request=>{
 const url=new URL(request.url),handler=handlers[url.pathname];if(handler)return handler(request);
 const path=url.pathname.split(`${bucket}/`)[1];
 if(url.pathname.startsWith('/synthetic-upload/')&&request.method==='PUT') {
  if(uploadTokens.get(url.searchParams.get('token'))!==path)return new Response(null,{status:403});
  if(images.has(path))return new Response(null,{status:409});
  const bytes=new Uint8Array(await request.arrayBuffer()),mime=request.headers.get('content-type');
  const etag=createHash('md5').update(bytes).digest('hex');images.set(path,{bytes,mime,etag});
  await query(`insert into storage.objects(bucket_id,name,metadata) values(${literal(bucket)},${literal(path)},${literal(JSON.stringify({size:bytes.length,mimetype:mime,eTag:etag}))}::jsonb);`);
  return new Response(null,{status:201});
 }
 if(url.pathname.startsWith('/storage/v1/object/authenticated/')) {
  downloadCount++;
  if(request.headers.get('authorization')!==`Bearer ${serverKey}`)return new Response(null,{status:403});
 } else if(url.pathname.startsWith('/storage/v1/object/sign/')) {
  const capability=viewTokens.get(url.searchParams.get('token'));
  if(!capability||capability.path!==path||capability.expires<=clock)return new Response(null,{status:403});
 } else return new Response(null,{status:404});
 const image=images.get(path);if(!image)return new Response(null,{status:404});
 return new Response(image.bytes,{headers:{'content-type':image.mime,etag:`"${image.etag}"`}});
});
base=`http://127.0.0.1:${server.addr.port}`;
let sequence=0;
const captcha=action=>`${action}:${++sequence}:`+'x'.repeat(24);
async function post(endpoint,body,token=null) {
 const response=await fetch(base+'/functions/v1/'+endpoint,{method:'POST',headers:{origin,apikey:publicKey,
  'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 return {status:response.status,body:await response.json()};
}
async function upload(bytes,mime) {
 const issued=await post('issue-inquiry-upload',{captchaToken:captcha('inquiry_upload'),mimeType:mime,sizeBytes:bytes.length});
 assert(issued.status===201,'Upload ticket issuance failed');const ticket=issued.body;
 const put=await fetch(`${base}/synthetic-upload/${bucket}/${ticket.path}?token=${ticket.token}`,{method:'PUT',headers:{'content-type':mime},body:bytes});
 assert(put.status===201,'Synthetic upload failed');
 return ticket.path;
}
const inquiry=path=>({subject:'Synthetic',customerName:'Example',customerEmail:'test@example.invalid',contactInfo:'Test',
 productName:'Test',quantity:1,imageLink:`storage://${bucket}/${path}`});
const submit=(path,key=crypto.randomUUID())=>post('submit-inquiry',{token:captcha('inquiry_submit'),idempotencyKey:key,inquiry:inquiry(path)});
const count=()=>query('select to_json(count(*)) from public.inquiries;');
try {
 const initial=await count();
 for(const mime of ['image/png','image/jpeg','image/webp']) {
  const bytes=imageBytes(mime),path=await upload(bytes,mime),key=crypto.randomUUID();
  const saved=await submit(path,key);assert(saved.status===201,'Verified submit failed: '+JSON.stringify(saved));
  const id=saved.body.inquiryId;
  const list=await post('admin-inquiries',{action:'list'},'synthetic-admin');
  assert(list.status===200&&list.body.inquiries.some(record=>record.id===id),'Admin cannot see committed record');
  for(const token of [null,'synthetic-member']) {
   const denied=await post('admin-inquiries',{action:'reference',inquiryId:id},token);
   assert(denied.status===(token?403:401),'Guest/member could access private reference');
  }
  const signed=await post('admin-inquiries',{action:'reference',inquiryId:id},'synthetic-admin');
  assert(signed.status===200,'Admin signing failed');
  const url=base+signed.body.url.slice(staging.length),view=await fetch(url);
  assert(view.status===200&&createHash('sha256').update(new Uint8Array(await view.arrayBuffer())).digest('hex')===createHash('sha256').update(bytes).digest('hex'),'Signed image content differs');
  clock+=61000;const expired=await fetch(url);await expired.body?.cancel();assert(expired.status===403,'Expired signed URL accepted');
  images.delete(path);await query(`delete from storage.objects where name=${literal(path)};`);
  const before=downloadCount,retry=await submit(path,key);
  assert(retry.status===200&&retry.body.inquiryId===id&&downloadCount===before,'Lost-response replay revalidated missing object or duplicated record');
 }
 assert(await count()===initial+3,'Unexpected valid inquiry count');
 const badImages=[{bytes:Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0]),mime:'image/png'},
  {bytes:imageBytes('image/jpeg'),mime:'image/png'}];
 for(const item of badImages) {
  const path=await upload(item.bytes,item.mime),rejected=await submit(path);
  assert(rejected.status===400&&await count()===initial+3,'Invalid bytes created an inquiry');
 }
 const stalePath=await upload(imageBytes('image/png'),'image/png');replaceBeforeCommit=true;
 assert((await submit(stalePath)).status===400&&await count()===initial+3,'Changed metadata was accepted after verification');
 const racePath=await upload(imageBytes('image/png'),'image/png'),raceKey=crypto.randomUUID();
 const concurrent=await Promise.all(Array.from({length:4},()=>submit(racePath,raceKey)));
 assert(concurrent.filter(r=>r.status===201).length===1&&concurrent.filter(r=>r.status===200).length===3&&
  new Set(concurrent.map(r=>r.body.inquiryId)).size===1&&await count()===initial+4,'Concurrent verified submits created duplicates');
 console.log('PASS: real HTTP + WASM + PostgreSQL; 3 formats, ticket/upload/submit/admin, guest/member denial, signed expiry, missing-image retry, corrupt/spoofed/stale rejection, four concurrent submits -> one record. Auth/CAPTCHA/Storage transport synthetic.');
} finally {await server.shutdown();}
