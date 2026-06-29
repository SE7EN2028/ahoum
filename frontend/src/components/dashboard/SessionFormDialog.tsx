import { useState } from "react";
import { catDefs, modeDefs } from "../../data/content";
import type { ApiSession } from "../../lib/api";
import { Close } from "../../lib/icons";

export interface SessionPayload {
  title: string;
  description: string;
  category: string;
  mode: string;
  location: string;
  price: number;
  capacity: number;
  starts_at: string;
  duration_min: number;
  status: string;
}

const CATS = catDefs.slice(1); // drop "all"
const MODES = modeDefs.slice(1);

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionFormDialog({ initial, onClose, onSubmit, pending }: {
  initial: ApiSession | null;
  onClose: () => void;
  onSubmit: (p: SessionPayload) => void;
  pending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState((initial?.category ?? "MEDITATION").toLowerCase());
  const [mode, setMode] = useState((initial?.mode ?? "ONLINE").toLowerCase());
  const [location, setLocation] = useState(initial?.location ?? "Online");
  const [price, setPrice] = useState(String(initial ? Number(initial.price) : 0));
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 10));
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.starts_at));
  const [duration, setDuration] = useState(String(initial?.duration_min ?? 60));
  const [status, setStatus] = useState(initial?.status ?? "PUBLISHED");
  const [error, setError] = useState("");

  const field = { width: "100%", border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", padding: "11px 13px", font: "400 .92rem 'Hanken Grotesk'", color: "var(--ink)", background: "var(--surface)", outline: "none" } as const;
  const label = { display: "block", font: "600 .78rem 'Hanken Grotesk'", color: "var(--ink-2)", marginBottom: 6 } as const;

  const submit = () => {
    if (!title.trim()) return setError("Title is required.");
    if (!startsAt) return setError("Pick a date and time.");
    setError("");
    onSubmit({
      title: title.trim(),
      description,
      category,
      mode,
      location,
      price: Number(price) || 0,
      capacity: Math.max(1, Number(capacity) || 1),
      starts_at: new Date(startsAt).toISOString(),
      duration_min: Math.max(1, Number(duration) || 60),
      status,
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,28,22,.5)", backdropFilter: "blur(3px)", zIndex: 70, display: "grid", placeItems: "center", padding: 24, animation: "fadeIn .2s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", background: "var(--surface)", borderRadius: 22, boxShadow: "var(--sh-lg)", padding: "28px 28px 24px", position: "relative", animation: "fadeUp .3s var(--ease) both" }}>
        <button onClick={onClose} aria-label="Close" className="close-btn" style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, border: "none", borderRadius: 999, background: "var(--paper)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Close size={17} /></button>
        <h2 style={{ fontWeight: 700, fontSize: "1.35rem", color: "var(--ink)", margin: "0 0 20px", letterSpacing: "-.01em" }}>{initial ? "Edit session" : "New session"}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={label}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Morning Vinyasa Flow" style={field} />
          </div>
          <div>
            <label style={label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What to expect" style={{ ...field, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={label}>Practice</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={field}>
                {CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Format</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} style={field}>
                {MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={label}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Online, or a venue" style={field} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={label}>Price (₹)</label>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} style={field} />
            </div>
            <div>
              <label style={label}>Capacity</label>
              <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} style={field} />
            </div>
            <div>
              <label style={label}>Minutes</label>
              <input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} style={field} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={label}>Starts at</label>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={field} />
            </div>
            <div>
              <label style={label}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={field}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: "var(--error)", fontSize: ".85rem", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={submit} disabled={pending} className="u-lift" style={{ flex: 1, height: 48, border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .92rem 'Hanken Grotesk'", cursor: pending ? "default" : "pointer" }}>{pending ? "Saving…" : initial ? "Save session" : "Create session"}</button>
            <button onClick={onClose} style={{ height: 48, padding: "0 22px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .92rem 'Hanken Grotesk'", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
