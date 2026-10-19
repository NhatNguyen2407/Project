// Role discovery is UI state only; database/Edge authorization stays server-side.
export function observeAuthState(client, publish, schedule = (run) => setTimeout(run, 0)) {
  let revision = 0;
  let active = true;
  let state = { user: null, role: 'customer', loading: true };
  const update = (session) => {
    if (!active) return;
    const current = ++revision;
    const user = session?.user ?? null;
    const sameResolvedUser = !!user && user.id === state.user?.id && !state.loading;
    // TOKEN_REFRESHED / focus SIGNED_IN must not unmount an in-progress form.
    // A changed account always clears the previous role before lookup.
    state = { user, role: sameResolvedUser ? state.role : 'customer', loading: !!user && !sameResolvedUser };
    publish(state);
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
      if (active && revision === current) {
        state = { user, role, loading: false };
        publish(state);
      }
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
