const loginRedirect = origin => new URL('/login', origin).href;

export async function requestPasswordReset(client, email, origin) {
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: new URL('/reset-password', origin).href,
  });
  if (error) throw error;
}

export async function registerCustomer(client, form, origin) {
  const { data, error } = await client.auth.signUp({
    email: form.email.trim(), password: form.password,
    options: { emailRedirectTo: loginRedirect(origin), data: { full_name: form.fullName.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithSocial(client, provider, origin) {
  const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: loginRedirect(origin) } });
  if (error) throw error;
}

export async function endRecoverySession(client) {
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    return !error;
  } catch {
    return false;
  }
}

export async function completePasswordRecovery(client, recovery, password, onPasswordChanged = () => {}) {
  if (recovery.getStatus() !== 'ready') throw new Error('Invalid recovery session');
  const { data, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!recovery.isRecoverySession(data?.session)) {
    recovery.invalidate();
    throw new Error('Invalid recovery session');
  }
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
  onPasswordChanged();
  recovery.invalidate();
  return endRecoverySession(client);
}
