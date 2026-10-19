import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../service/supabase';
import { observeAuthState } from '../utils/authState';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return observeAuthState(supabase, (state) => {
      setUser(state.user);
      setRole(state.role);
      setLoading(state.loading);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
