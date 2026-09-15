import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredToken, setStoredToken } from '../services/api.js';
import { getCurrentAdmin, loginAdmin, logoutAdmin, verifyOwnerOtp } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getStoredToken()));

  const loadCurrentAdmin = useCallback(async () => {
    if (!getStoredToken()) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch (error) {
      setAdmin(null);
      setStoredToken(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentAdmin();

    function handleExpiredSession() {
      setAdmin(null);
    }

    window.addEventListener('kelvin:auth-expired', handleExpiredSession);

    return () => {
      window.removeEventListener('kelvin:auth-expired', handleExpiredSession);
    };
  }, [loadCurrentAdmin]);

  async function login(credentials) {
    const data = await loginAdmin(credentials);
    const user = data.user || data.admin || data.data;
    setAdmin(user);
    return user;
  }

  async function loginWithOwnerOtp(credentials) {
    const data = await verifyOwnerOtp(credentials);
    const user = data.user || data.admin || data.data;
    setAdmin(user);
    return user;
  }

  async function logout() {
    await logoutAdmin();
    setAdmin(null);
  }

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isBootstrapping,
      updateAdmin: setAdmin,
      login,
      loginWithOwnerOtp,
      logout
    }),
    [admin, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
