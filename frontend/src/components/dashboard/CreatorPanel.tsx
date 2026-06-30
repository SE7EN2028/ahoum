import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../../auth/AppContext";
import { api, type ApiSession } from "../../lib/api";
import { mapSession } from "../../lib/sessions";
import SessionFormDialog, { type SessionPayload } from "./SessionFormDialog";

interface Attendee { id: number; user: { id: number; name: string; email: string }; status: string; created_at: string; }

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PUBLISHED: { bg: "oklch(0.95 0.04 150)", color: "var(--green)" },
  DRAFT: { bg: "var(--paper)", color: "var(--muted)" },
  CANCELLED: { bg: "var(--error-soft)", color: "var(--error)" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.DRAFT;
  return <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999, background: s.bg, color: s.color, font: "600 .66rem 'Hanken Grotesk'", textTransform: "capitalize" }}>{status.toLowerCase()}</span>;
}

function AttendeesList({ sessionId }: { sessionId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["attendees", sessionId],
    queryFn: () => api<Attendee[]>(`/sessions/${sessionId}/bookings/`, { auth: true }),
  });
  if (isLoading) return <p style={{ color: "var(--muted)", fontSize: ".85rem", margin: "10px 0 0" }}>Loading attendees…</p>;
  const active = (data ?? []).filter((a) => a.status === "ACTIVE");
  if (active.length === 0) return <p style={{ color: "var(--muted)", fontSize: ".85rem", margin: "10px 0 0" }}>No bookings yet.</p>;
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      {active.map((a) => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--paper)", borderRadius: 10 }}>
          <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 999, background: "var(--green-deep)", color: "var(--lime)", font: "700 .66rem 'Hanken Grotesk'" }}>{(a.user.name || a.user.email).slice(0, 2).toUpperCase()}</span>
          <span style={{ fontWeight: 500, fontSize: ".88rem", color: "var(--ink)" }}>{a.user.name || a.user.email}</span>
          <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>{a.user.email}</span>
        </div>
      ))}
    </div>
  );
}

export default function CreatorPanel() {
  const { toast } = useApp();
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<{ session: ApiSession | null } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", "mine"],
    queryFn: () => api<ApiSession[]>("/sessions/?mine=1", { auth: true }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sessions"] });
  };

  const createOrUpdate = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: SessionPayload }) =>
      api<ApiSession>(id ? `/sessions/${id}/` : "/sessions/", { method: id ? "PATCH" : "POST", auth: true, body: payload }),
    onSuccess: (_d, vars) => {
      toast(vars.id ? "Session updated." : "Session created.");
      setDialog(null);
      invalidate();
    },
    onError: (e: Error) => toast(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api<ApiSession>(`/sessions/${id}/`, { method: "PATCH", auth: true, body: { status } }),
    onSuccess: () => { toast("Session updated."); invalidate(); },
    onError: (e: Error) => toast(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api<void>(`/sessions/${id}/`, { method: "DELETE", auth: true }),
    onSuccess: () => { toast("Session deleted."); setConfirmDelete(null); invalidate(); },
    onError: (e: Error) => toast(e.message),
  });

  const sessions = data ?? [];
  const btn = { height: 34, padding: "0 14px", borderRadius: 999, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", font: "600 .78rem 'Hanken Grotesk'", cursor: "pointer" } as const;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: ".95rem" }}>{sessions.length} session{sessions.length === 1 ? "" : "s"}</p>
        <button onClick={() => setDialog({ session: null })} className="u-lift" style={{ height: 44, padding: "0 22px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .88rem 'Hanken Grotesk'", cursor: "pointer" }}>+ New session</button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[0, 1].map((i) => <div key={i} className="sk" style={{ height: 96, borderRadius: "var(--r-md)" }} />)}</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
          <h3 style={{ fontWeight: 600, fontSize: "1.25rem", color: "var(--ink)", margin: "0 0 8px" }}>Host your first session</h3>
          <p style={{ color: "var(--muted)", margin: "0 auto 20px", maxWidth: "34ch" }}>Create a session and it appears in the public catalog for people to book.</p>
          <button onClick={() => setDialog({ session: null })} style={{ height: 44, padding: "0 22px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .9rem 'Hanken Grotesk'", cursor: "pointer" }}>+ New session</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((raw) => {
            const s = mapSession(raw);
            const booked = raw.capacity - raw.seats_left;
            const isOpen = expanded === raw.id;
            return (
              <div key={raw.id} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)" }}>{raw.title}</span>
                      <StatusBadge status={raw.status} />
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>{s.catLabel} · {s.modeLabel} · {s.date} {s.time}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--ink)" }}>{booked}<span style={{ color: "var(--muted)", fontWeight: 500 }}> / {raw.capacity}</span></div>
                    <div style={{ color: "var(--muted)", fontSize: ".72rem" }}>booked</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  <button style={btn} onClick={() => setDialog({ session: raw })}>Edit</button>
                  {raw.status === "PUBLISHED" ? (
                    <button style={btn} onClick={() => statusMutation.mutate({ id: raw.id, status: "DRAFT" })}>Unpublish</button>
                  ) : (
                    <button style={btn} onClick={() => statusMutation.mutate({ id: raw.id, status: "PUBLISHED" })}>Publish</button>
                  )}
                  <button style={btn} onClick={() => setExpanded(isOpen ? null : raw.id)}>{isOpen ? "Hide attendees" : `Attendees (${booked})`}</button>
                  {confirmDelete === raw.id ? (
                    <>
                      <button style={{ ...btn, color: "var(--error)", borderColor: "var(--error)" }} onClick={() => deleteMutation.mutate(raw.id)}>Confirm delete</button>
                      <button style={btn} onClick={() => setConfirmDelete(null)}>Keep</button>
                    </>
                  ) : (
                    <button style={{ ...btn, color: "var(--error)" }} onClick={() => setConfirmDelete(raw.id)}>Delete</button>
                  )}
                </div>

                {isOpen && <AttendeesList sessionId={raw.id} />}
              </div>
            );
          })}
        </div>
      )}

      {dialog && (
        <SessionFormDialog
          initial={dialog.session}
          pending={createOrUpdate.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(payload) => createOrUpdate.mutate({ id: dialog.session?.id, payload })}
        />
      )}
    </div>
  );
}
