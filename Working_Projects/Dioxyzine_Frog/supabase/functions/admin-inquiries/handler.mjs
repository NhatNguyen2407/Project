// Staging-only, read-only Admin Inquiry API. Do not deploy before Auth/RLS E2E.
import { classifyInquiryCaller,isAllowedInquiryPreflight } from '../submit-inquiry/requestAuth.mjs';
import { isAllowedRequestOrigin } from '../submit-inquiry/validation.mjs';
const STAGING='https://bvnnmvlfcduwmneipmsi.supabase.co';
const BUCKET='inquiry-test-references';
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IMAGE=/^storage:\/\/inquiry-test-references\/(guest\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:png|jpg|webp))$/i;
const COLUMNS='id,created_at,subject,customer_name,customer_email,contact_info,product_name,size,quantity,accessory_qty,image_link,note,status';
function reply(status,body,origin){
  return new Response(JSON.stringify(body),{status,headers:{
    'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
    ...(origin?{'Access-Control-Allow-Origin':origin}:{})
  }});
}
export function validateAction(value){
  if(!value || typeof value!=='object' || Array.isArray(value))return null;
  const keys=Object.keys(value);
  if(keys.length===1 && value.action==='list')return {action:'list'};
  if(keys.length===2 && value.action==='reference' && typeof value.inquiryId==='string' && ID.test(value.inquiryId))
    return {action:'reference',inquiryId:value.inquiryId};
  return null;
}
export function validSignedImageUrl(value,path){
  if(typeof value!=='string' || !IMAGE.test('storage://'+BUCKET+'/'+path))return false;
  try{
    const u=new URL(value);
    return u.origin===STAGING && !u.username && !u.password &&
      u.pathname===`/storage/v1/object/sign/${BUCKET}/${path}` &&
      !!u.searchParams.get('token');
  }catch{return false;}
}
async function readJson(req){
  if(!req.body)throw Error('Body missing');
  const reader=req.body.getReader();const parts=[];let size=0;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>1024){await reader.cancel().catch(()=>{});throw Error('Body too large');}
      parts.push(value);
    }
  }finally{reader.releaseLock();}
  const buf=new Uint8Array(size);let pos=0;
  for(const part of parts){buf.set(part,pos);pos+=part.byteLength;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buf));
}
export function createAdminInquiryReadHandler({
  envGet,createClient,logger=console,
  allowedCorsHeaders='authorization, apikey, x-client-info, content-type',
}){
  if(typeof envGet!=='function'||typeof createClient!=='function')throw TypeError('Dependencies required');
  return async function adminInquiries(request){
    const origin=request.headers.get('origin');
    if(!isAllowedRequestOrigin(origin,envGet('INQUIRY_ALLOWED_ORIGINS')||''))
      return reply(403,{success:false},null);
    if(request.method==='OPTIONS'){
      if(!isAllowedInquiryPreflight(request,allowedCorsHeaders))
        return reply(403,{success:false},null);
      return new Response(null,{status:204,headers:{
        'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Allow-Headers':allowedCorsHeaders,'Vary':'Origin'
      }});
    }
    if(request.method!=='POST')return reply(405,{success:false},origin);
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))
      return reply(415,{success:false},origin);
    const size=Number(request.headers.get('content-length')||'0');
    if(!Number.isFinite(size)||size>1024)return reply(413,{success:false},origin);
    const url=envGet('SUPABASE_URL'),serverKey=envGet('SUPABASE_SERVICE_ROLE_KEY');
    const publicKey=envGet('INQUIRY_PUBLIC_API_KEY');
    if(envGet('INQUIRY_ADMIN_READ_STAGING_ENABLED')!=='true' || url!==STAGING ||
       !serverKey || !publicKey || serverKey===publicKey)
      return reply(503,{success:false,message:'Service disabled.'},origin);
    const caller=classifyInquiryCaller(request.headers,publicKey,serverKey);
    if(caller.status!==200||!caller.userToken)return reply(401,{success:false},origin);
    try{
      const input=validateAction(await readJson(request));
      if(!input)return reply(400,{success:false},origin);
      const admin=createClient(url,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
      const {data:identity,error:authError}=await admin.auth.getUser(caller.userToken);
      const uid=identity?.user?.id;
      if(authError||typeof uid!=='string'||!ID.test(uid))
        return reply(401,{success:false},origin);
      const {data:roles,error:roleError}=await admin.from('user_roles').select('role')
        .eq('user_id',uid).eq('role','admin').limit(1);
      if(roleError)return reply(503,{success:false},origin);
      if(!Array.isArray(roles)||roles.length!==1||roles[0]?.role!=='admin')
        return reply(403,{success:false},origin);
      if(input.action==='list'){
        const {data,error}=await admin.from('inquiries').select(COLUMNS)
          .order('created_at',{ascending:false}).limit(100);
        if(error||!Array.isArray(data))return reply(503,{success:false},origin);
        return reply(200,{success:true,inquiries:data},origin);
      }
      const {data,error}=await admin.from('inquiries').select('image_link')
        .eq('id',input.inquiryId).maybeSingle();
      if(error)return reply(503,{success:false},origin);
      if(!data)return reply(404,{success:false},origin);
      const match=IMAGE.exec(data.image_link||'');
      if(!match)return reply(400,{success:false},origin);
      const path=match[1];
      const {data:signed,error:signError}=await admin.storage.from(BUCKET).createSignedUrl(path,60);
      if(signError||!validSignedImageUrl(signed?.signedUrl,path))
        return reply(503,{success:false},origin);
      return reply(200,{success:true,url:signed.signedUrl,expiresIn:60},origin);
    }catch(error){
      logger.error('Admin Inquiry reader:',error instanceof Error?error.name:'unknown');
      return reply(503,{success:false},origin);
    }
  };
}
