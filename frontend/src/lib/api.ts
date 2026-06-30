import { authStore } from "./authStore";

export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export interface Me {
  id: number;
  username: string;
  email: string;
  role: "USER" | "CREATOR";
  display_name: string;
  bio: string;
  avatar: string | null;
}

export interface AuthResult {
  access: string;
  refresh: string;
  user: Me;
}

export interface ApiSession {
  id: number;
  title: string;
  description: string;
  category: string;
  mode: string;
  location: string;
  price: string;
  capacity: number;
  starts_at: string;
  duration_min: number;
  image: string | null;
  image_url: string;
  status: string;
  seats_left: number;
  is_sold_out: boolean;
  creator: { id: number; name: string; initials: string; verified: boolean };
  created_at: string;
}

export interface ApiBooking {
  id: number;
  session: ApiSession;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  created_at: string;
}

type Opts = Omit<RequestInit, "body"> & { token?: string; auth?: boolean; body?: unknown };

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { token, auth, body, headers, ...rest } = opts;
  const authed = auth || !!token;

  let payload: BodyInit | undefined;
  const baseHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    baseHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const send = (bearer?: string) => {
    const h = { ...baseHeaders };
    const access = bearer ?? (authed ? authStore.getAccess() ?? token : undefined);
    if (access) h["Authorization"] = `Bearer ${access}`;
    return fetch(`${API_BASE}${path}`, { ...rest, headers: h, body: payload });
  };

  let res = await send();

  // transparent refresh: on 401, swap the refresh token for a new access and retry once
  if (res.status === 401 && authed && authStore.getRefresh()) {
    try {
      const fresh = await authStore.refresh();
      res = await send(fresh);
    } catch {
      /* refresh failed; fall through to the 401 error below */
    }
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* non-json error */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Display name + initials derived from a Me record. */
export function nameOf(me: Me): { name: string; initials: string } {
  const local = me.email ? me.email.split("@")[0] : me.username;
  const base = (me.display_name || "").trim() || local.replace(/[._-]+/g, " ");
  const name = base.replace(/\b\w/g, (c) => c.toUpperCase());
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
  return { name, initials };
}
