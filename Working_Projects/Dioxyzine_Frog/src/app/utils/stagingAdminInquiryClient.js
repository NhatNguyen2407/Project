// Read-only Admin Inbox transport for synthetic Staging. The Edge Function
// separately verifies the Auth session and Admin role before using privileges.
// This gate is a safety switch, NOT a substitute for server authorization.
export const STAGING_ADMIN_SUPABASE_URL='https://bvnnmvlfcduwmneipmsi.supabase.co';
const REF=/^storage:\/\/inquiry-test-references\/(guest\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:png|jpg|webp))$/i;
const INQUIRY_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isStagingAdminInquiryEnabled({environment,supabaseUrl,optIn}={}){
  return environment==='preview' && supabaseUrl===STAGING_ADMIN_SUPABASE_URL
    && optIn==='true';
}

export function isPrivateInquiryReference(reference){
  return typeof reference==='string' && REF.test(reference);
}

export function isAuthorizedStagingReferenceUrl(url,reference){
  const match=typeof reference==='string'?REF.exec(reference):null;
  if(!match || typeof url!=='string')return false;
  try{
    const parsed=new URL(url);
    return parsed.origin===STAGING_ADMIN_SUPABASE_URL &&
      !parsed.username && !parsed.password && !parsed.hash &&
      parsed.pathname==='/storage/v1/object/sign/inquiry-test-references/'+match[1] &&
      parsed.searchParams.size===1 && !!parsed.searchParams.get('token');
  }catch{return false;}
}

function requireClient(client,gate){
  if(!isStagingAdminInquiryEnabled(gate) || !client?.functions?.invoke)
    throw new Error('Staging Admin Inquiry access is disabled.');
}

export async function loadStagingAdminInquiries(client,gate){
  requireClient(client,gate);
  const {data,error}=await client.functions.invoke('admin-inquiries',{body:{action:'list'}});
  if(error || data?.success!==true || !Array.isArray(data.inquiries) ||
     data.inquiries.length>100 || data.inquiries.some(item=>!item || typeof item!=='object' || Array.isArray(item)))
    throw new Error('The Staging Inbox could not be verified.');
  return data.inquiries;
}

export async function openStagingAdminReference(client,gate,inquiry){
  requireClient(client,gate);
  if(!inquiry || !INQUIRY_ID.test(inquiry.id||'') ||
     !isPrivateInquiryReference(inquiry.image_link))
    throw new Error('Private Inquiry image is unavailable.');
  const {data,error}=await client.functions.invoke('admin-inquiries',{
    body:{action:'reference',inquiryId:inquiry.id}
  });
  if(error || data?.success!==true || data.expiresIn!==60 ||
     !isAuthorizedStagingReferenceUrl(data.url,inquiry.image_link))
    throw new Error('The private image link could not be verified.');
  return data.url;
}
