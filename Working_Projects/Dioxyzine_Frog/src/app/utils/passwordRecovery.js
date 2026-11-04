const STORAGE_KEY = 'dioxyzine_password_recovery';

export function hasAuthRedirectError(address) {
  try {
    const url = new URL(address);
    return [url.searchParams, new URLSearchParams(url.hash.slice(1))]
      .some(params => ['error', 'error_code', 'error_description'].some(key => params.has(key)));
  } catch {
    return true;
  }
}

function sessionId(session) {
  try {
    const payload = session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).session_id || null;
  } catch {
    return null;
  }
}

export function createPasswordRecoveryTracker(client, { redirectError = false, storage, timeoutMs = 10000, now = Date.now } = {}) {
  let marker = null;
  try { marker = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null'); } catch { /* Storage is optional. */ }
  let status = redirectError ? 'invalid' : 'checking';
  let active = true;
  const listeners = new Set();
  const publish = next => {
    if (!active) return;
    status = next;
    if (next !== 'checking') clearTimeout(timer);
    listeners.forEach(listener => listener(status));
  };
  const clearMarker = () => {
    marker = null;
    try { storage?.removeItem(STORAGE_KEY); } catch { /* Keep the in-memory state cleared. */ }
  };
  const invalidate = () => { clearMarker(); publish('invalid'); };
  const matches = session => Boolean(marker && typeof marker.sessionId === 'string' && marker.sessionId &&
    session?.user?.id && session.user.id === marker.userId && sessionId(session) === marker.sessionId &&
    session.expires_at > now() / 1000 && marker.expiresAt > now() / 1000);
  const timer = setTimeout(() => { if (status === 'checking') publish('error'); }, timeoutMs);
  if (redirectError) { clearMarker(); clearTimeout(timer); }

  // Subscribe when the client is created, before a recovery page can miss the event.
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    if (!active || redirectError) return;
    const id = sessionId(session);
    if (event === 'PASSWORD_RECOVERY' && session?.user?.id && id && session.expires_at > now() / 1000) {
      // Persist no credentials: only the verified session identity and a bounded expiry.
      marker = { userId: session.user.id, sessionId: id, expiresAt: Math.min(session.expires_at, now() / 1000 + 3600) };
      try { storage?.setItem(STORAGE_KEY, JSON.stringify(marker)); } catch { /* Recovery still works without storage. */ }
      publish('ready');
    } else if (matches(session)) {
      publish('ready');
    } else if (event === 'INITIAL_SESSION') {
      clearMarker();
      // The SDK may emit PASSWORD_RECOVERY just after INITIAL_SESSION.
      setTimeout(() => { if (status === 'checking') publish('invalid'); }, 0);
    } else {
      invalidate();
    }
  });

  return {
    getStatus: () => status,
    isRecoverySession: session => status === 'ready' && matches(session),
    invalidate,
    subscribe(listener) {
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    dispose() {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
      listeners.clear();
    },
  };
}
