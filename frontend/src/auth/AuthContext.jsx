import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  refreshAccessToken,
  setAuthSession,
  subscribeToAuthChanges,
} from "../api/client";

const AuthContext = createContext(null);

export function getDefaultRouteForRole(role) {
  if (role === "admin" || role === "manager" || role === "employee") {
    return "/dashboard";
  }

  return "/login";
}

function getInitialStatus() {
  if (getAccessToken()) return "authenticated";
  if (getRefreshToken()) return "restoring";
  return "unauthenticated";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [status, setStatus] = useState(() => getInitialStatus());

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setUser(getStoredUser());
      setStatus(getInitialStatus());
    });
  }, []);

  const restoreSession = useCallback(async () => {
    if (getAccessToken()) {
      setStatus("authenticated");
      setUser(getStoredUser());
      return true;
    }

    if (!getRefreshToken()) {
      setStatus("unauthenticated");
      setUser(null);
      return false;
    }

    setStatus("restoring");

    try {
      await refreshAccessToken();
      setUser(getStoredUser());
      setStatus("authenticated");
      return true;
    } catch {
      clearAuthSession();
      setUser(null);
      setStatus("unauthenticated");
      return false;
    }
  }, []);

  useEffect(() => {
    if (status === "restoring") {
      void restoreSession();
    }
  }, [restoreSession, status]);

  const applySession = (session) => {
    setAuthSession(session);
    setUser(session.user ?? null);
    setStatus("authenticated");
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear local session even if the access token is already invalid.
    } finally {
      clearAuthSession();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === "authenticated",
    defaultRoute: getDefaultRouteForRole(user?.role),
    applySession,
    restoreSession,
    logout,
  }), [logout, restoreSession, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
