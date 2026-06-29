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

type Opts = Omit<RequestInit, "body"> & { token?: string; body?: unknown };

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const { token, body, headers, ...rest } = opts;
  const h: Record<string, string> = { ...(headers as Record<string, string>) };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  if (token) h["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: h, body: payload });
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
