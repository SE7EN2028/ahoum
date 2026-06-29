import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api, nameOf, type AuthResult, type Me } from "../lib/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
const TOKEN_KEY = "ahoum_access";
const REFRESH_KEY = "ahoum_refresh";

interface AppState {
  user: Me | null;
  token: string | null;
  userName: string;
  userInitials: string;
  signingIn: boolean;
  authReady: boolean;
  setUser: (me: Me) => void;
  // ui
  loginOpen: boolean;
  mobileOpen: boolean;
  menuOpen: boolean;
  toastMsg: string | null;
  // actions
  signIn: () => void;
  finishGoogle: (code: string) => Promise<void>;
  logout: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  toast: (msg: string) => void;
  scrollToSessions: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [authReady, setAuthReady] = useState(() => !localStorage.getItem(TOKEN_KEY));
  const [signingIn, setSigningIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const persist = useCallback((res: AuthResult) => {
    localStorage.setItem(TOKEN_KEY, res.access);
    localStorage.setItem(REFRESH_KEY, res.refresh);
    setToken(res.access);
    setUser(res.user);
  }, []);

  // restore session
  useEffect(() => {
    if (!token) {
      setAuthReady(true);
      return;
    }
    api<Me>("/me/", { token })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setAuthReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const devLogin = useCallback(async () => {
    const res = await api<AuthResult>("/auth/dev-login/", { method: "POST", body: {} });
    persist(res);
  }, [persist]);

  const signIn = useCallback(() => {
    if (signingIn) return;
    setSigningIn(true);
    if (GOOGLE_CLIENT_ID) {
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return; // navigates away
    }
    // dev fallback so the app is fully usable without Google credentials
    devLogin()
      .then(() => {
        setLoginOpen(false);
        toast("Signed in. Welcome to Ahoum.");
      })
      .catch(() => toast("Sign in failed. Please try again."))
      .finally(() => setSigningIn(false));
  }, [signingIn, devLogin, toast]);

  const finishGoogle = useCallback(
    async (code: string) => {
      const res = await api<AuthResult>("/auth/google/", {
        method: "POST",
        body: { code, redirect_uri: REDIRECT_URI },
      });
      persist(res);
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
    setUser(null);
    setMenuOpen(false);
    toast("You are signed out.");
  }, [toast]);

  const scrollToSessions = useCallback(() => {
    setMobileOpen(false);
    const el = document.getElementById("sessions");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: "smooth" });
  }, []);

  const meta = user ? nameOf(user) : { name: "", initials: "" };

  const value: AppState = {
    user,
    token,
    userName: meta.name,
    userInitials: meta.initials,
    signingIn,
    authReady,
    setUser,
    loginOpen,
    mobileOpen,
    menuOpen,
    toastMsg,
    signIn,
    finishGoogle,
    logout,
    openLogin: () => { setLoginOpen(true); setMobileOpen(false); setMenuOpen(false); },
    closeLogin: () => { if (!signingIn) setLoginOpen(false); },
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    toggleMenu: () => setMenuOpen((m) => !m),
    closeMenu: () => setMenuOpen(false),
    toast,
    scrollToSessions,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
