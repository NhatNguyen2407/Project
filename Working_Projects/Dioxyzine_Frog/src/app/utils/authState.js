// Role discovery is UI state only; database/Edge authorization stays server-side.
export function observeAuthState(client, publish, schedule = (run) => setTimeout(run, 0)) {
  let revision = 0;
  let active = true;
  const update = (session) => {
    if (!active) return;
    const current = ++revision;
    const user = session?.user ?? null;
    publish({ user, role: 'customer', loading: !!user });
    if (!user) return;
    // Supabase auth callbacks must return before another SDK operation starts.
    schedule(async () => {
      if (!active || revision !== current) return;
      let role = 'customer';
      try {
        const { data, error } = await client.from('user_roles').select('role')
          .eq('user_id', user.id).maybeSingle();
        if (!error && data?.role === 'admin') role = 'admin';
      } catch { /* Permission/network failures stay unprivileged. */ }
      if (active && revision === current) publish({ user, role, loading: false });
    });
  };
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    update(session);
  });
  const bootstrapRevision = revision;
  client.auth.getSession().then(({ data, error }) => {
    if (active && revision === bootstrapRevision) update(error ? null : data?.session);
  }).catch(() => {
    if (active && revision === bootstrapRevision) update(null);
  });
  return () => { active = false; revision++; subscription.unsubscribe(); };
}
