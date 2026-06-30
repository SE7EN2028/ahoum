// Single source of truth for JWT tokens + transparent refresh.
const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const ACCESS_KEY = "ahoum_access";
const REFRESH_KEY = "ahoum_refresh";

let access: string | null = localStorage.getItem(ACCESS_KEY);
let refresh: string | null = localStorage.getItem(REFRESH_KEY);
let inFlight: Promise<string> | null = null;
let onClearCb: (() => void) | null = null;

export const authStore = {
  getAccess: () => access,
  getRefresh: () => refresh,

  setTokens(a: string, r: string) {
    access = a;
    refresh = r;
    localStorage.setItem(ACCESS_KEY, a);
    localStorage.setItem(REFRESH_KEY, r);
  },

  clear() {
    access = null;
    refresh = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    onClearCb?.();
  },

  /** Called when the session can no longer be refreshed (forces a logout in the UI). */
  onClear(cb: () => void) {
    onClearCb = cb;
  },

  /** Exchange the refresh token for a fresh access token. De-duped: concurrent
   * callers share one network request. Rejects (and clears) if refresh fails. */
  refresh(): Promise<string> {
    if (!refresh) return Promise.reject(new Error("No refresh token"));
    if (!inFlight) {
      const current = refresh;
      inFlight = fetch(`${API_BASE}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: current }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Token refresh failed");
          const data = await res.json();
          authStore.setTokens(data.access, data.refresh || current);
          return data.access as string;
        })
        .catch((e) => {
          authStore.clear();
          throw e;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  },
};
