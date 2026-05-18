/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const t = localStorage.getItem('token');
    return { user: t ? decodeToken(t) : null, token: t };
  });

  useEffect(() => {
    let isMounted = true;
    const t = localStorage.getItem('token');
    queueMicrotask(() => {
      if (isMounted) setAuth({ user: t ? decodeToken(t) : null, token: t });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  function login(token) {
    localStorage.setItem('token', token);
    const userData = decodeToken(token);
    setAuth({ user: userData, token });
  }

  function logout() {
    localStorage.removeItem('token');
    setAuth({ user: null, token: null });
  }

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
