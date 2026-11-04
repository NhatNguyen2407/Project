export const INITIAL_AUTH_STATE = Object.freeze({
  user: null, role: 'customer', loading: true, error: null,
});

export const getSignedInPath = role => role === 'admin' ? '/admin' : '/profile';

export function observeAuthSession(client, onChange, { timeoutMs = 10000 } = {}) {
  let state = { ...INITIAL_AUTH_STATE };
  let active = true;
  let revision = 0;
  let cancelRole = () => {};
  const publish = next => {
    if (active) {
      state = next;
      onChange(state);
    }
  };
  const sessionTimer = setTimeout(() => {
    if (active && revision === 0) {
      revision++;
      publish({ ...INITIAL_AUTH_STATE, loading: false, error: 'Could not check your session. Please retry.' });
    }
  }, timeoutMs);

  const acceptSession = session => {
    const currentRevision = ++revision;
    clearTimeout(sessionTimer);
    cancelRole();
    const user = session?.user ?? null;
    const sameUser = user && user.id === state.user?.id && !state.error;
    publish({
      user,
      role: sameUser ? state.role : 'customer',
      loading: Boolean(user && (!sameUser || state.loading)),
      error: null,
    });
    if (!user) return;

    // Keep Supabase requests outside the Auth notification callback.
    const task = setTimeout(async () => {
      const controller = new AbortController();
      let cancelled = false;
      const isCurrent = () => active && !cancelled && revision === currentRevision;
      const fail = () => publish({
        user, role: 'customer', loading: false,
        error: 'Could not load your account permissions. Please retry.',
      });
      const timer = setTimeout(() => {
        if (!isCurrent()) return;
        cancelled = true;
        controller.abort();
        fail();
      }, timeoutMs);
      cancelRole = () => {
        cancelled = true;
        clearTimeout(timer);
        controller.abort();
      };
      try {
        const { data, error } = await client.from('user_roles').select('role')
          .eq('user_id', user.id).maybeSingle().abortSignal(controller.signal);
        if (error) throw error;
        if (isCurrent()) publish({ user, role: data?.role === 'admin' ? 'admin' : 'customer', loading: false, error: null });
      } catch {
        if (isCurrent()) fail();
      } finally {
        clearTimeout(timer);
      }
    }, 0);
    cancelRole = () => clearTimeout(task);
  };

  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    acceptSession(session);
  });
  Promise.resolve().then(() => client.auth.getSession()).then(({ data, error }) => {
    // A newer sign-in/sign-out event always wins over the startup read.
    if (!active || revision !== 0) return;
    if (error) throw error;
    acceptSession(data?.session);
  }).catch(() => {
    if (!active || revision !== 0) return;
    revision++;
    clearTimeout(sessionTimer);
    publish({ ...INITIAL_AUTH_STATE, loading: false, error: 'Could not check your session. Please retry.' });
  });

  return () => {
    active = false;
    revision++;
    clearTimeout(sessionTimer);
    cancelRole();
    subscription.unsubscribe();
  };
}
