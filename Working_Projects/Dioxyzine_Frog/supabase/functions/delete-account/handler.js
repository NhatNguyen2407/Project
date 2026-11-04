const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });

export function createDeleteAccountHandler(createClient, getEnv) {
  return async req => {
    if (req.method === 'OPTIONS') return reply(200, { success: true });
    if (req.method !== 'POST') return reply(405, { success: false, error: 'Use POST to delete your account.' });
    const authorization = req.headers.get('Authorization') || '';
    if (!/^Bearer \S+$/i.test(authorization)) return reply(401, { success: false, error: 'Please sign in again.' });
    let body;
    try { body = await req.json(); } catch { return reply(400, { success: false, error: 'Type DELETE to confirm.' }); }
    if (body?.confirmation !== 'DELETE' || !body.userId) return reply(400, { success: false, error: 'Type DELETE to confirm your account.' });
    let storageTouched = false;
    try {
      const url = getEnv('SUPABASE_URL');
      const anonKey = getEnv('SUPABASE_ANON_KEY');
      const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
      if (!url || !anonKey || !serviceKey) throw new Error('Missing server configuration');
      const auth = { persistSession: false, autoRefreshToken: false };
      const caller = createClient(url, anonKey, { auth, global: { headers: { Authorization: authorization } } });
      const { data, error } = await caller.auth.getUser();
      if (error || !data?.user) return reply(401, { success: false, error: 'Please sign in again.' });
      // The target comes only from the verified token, never a request-body user ID.
      const userId = data.user.id;
      if (body.userId !== userId) return reply(409, { success: false, error: 'Your account changed. Reload before deleting.' });
      const admin = createClient(url, serviceKey, { auth });
      const avatars = admin.storage.from('avatars');
      const paths = [];
      for (let offset = 0; ; offset += 100) {
        const { data: files, error: listError } = await avatars.list('', {
          search: `${userId}-`, limit: 100, offset, sortBy: { column: 'name', order: 'asc' },
        });
        if (listError || !Array.isArray(files)) throw new Error('Avatar listing failed');
        paths.push(...files.filter(file => file.id && file.name.startsWith(`${userId}-`)).map(file => file.name));
        if (files.length < 100) break;
      }
      for (let offset = 0; offset < paths.length; offset += 1000) {
        storageTouched = true;
        const { error: removeError } = await avatars.remove(paths.slice(offset, offset + 1000));
        if (removeError) throw removeError;
      }
      // The database trigger anonymizes business records in this same Auth deletion transaction.
      const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;
      return reply(200, { success: true });
    } catch {
      const suffix = storageTouched ? ' Some avatar files may already have been removed.' : '';
      return reply(500, { success: false, error: `Account deletion could not be confirmed. Please retry or contact support.${suffix}` });
    }
  };
}
