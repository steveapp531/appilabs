import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../lib/api.js';

// Access token lives in memory only. The refresh token is an httpOnly cookie set by the API.
const AuthContext = createContext(null);
const CSRF = { 'X-Requested-With': 'appilabs' };

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });
  const token = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh', null, { headers: CSRF });
      token.current = res.data.accessToken;
      setState({ status: 'authed', user: res.data.user });
      return true;
    } catch {
      token.current = null;
      setState({ status: 'anon', user: null });
      return false;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signIn = (data) => {
    token.current = data.accessToken;
    setState({ status: 'authed', user: data.user });
  };
  const signOut = async () => {
    await api.post('/auth/logout', null, { headers: CSRF }).catch(() => {});
    token.current = null;
    setState({ status: 'anon', user: null });
  };

  /** Authenticated request with one automatic refresh on 401. */
  const call = useCallback(async (method, path, body, opts = {}) => {
    const run = () => api.request(path, { method, body, token: token.current, ...opts });
    try {
      return await run();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && (await refresh())) return run();
      throw err;
    }
  }, [refresh]);

  return <AuthContext.Provider value={{ ...state, signIn, signOut, call }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export const can = (user, roles) => Boolean(user && roles.includes(user.role));
