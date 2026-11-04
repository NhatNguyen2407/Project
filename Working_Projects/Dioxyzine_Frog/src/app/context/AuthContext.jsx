import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../service/supabase';
import { INITIAL_AUTH_STATE, observeAuthSession } from '../utils/authSession';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(INITIAL_AUTH_STATE);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => observeAuthSession(supabase, setAuth), [attempt]);
  const retry = () => {
    setAuth(INITIAL_AUTH_STATE);
    setAttempt(current => current + 1);
  };

  return (
    <AuthContext.Provider value={{ ...auth, retry }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
