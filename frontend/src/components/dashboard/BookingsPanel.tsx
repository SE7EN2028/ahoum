import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../../auth/AppContext";
import { api, type ApiBooking } from "../../lib/api";
import { mapSession } from "../../lib/sessions";
import { Calendar, Clock, Pin, Video } from "../../lib/icons";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "var(--good-soft, oklch(0.95 0.04 150))", color: "var(--green)" },
  CANCELLED: { bg: "var(--error-soft)", color: "var(--error)" },
  COMPLETED: { bg: "var(--paper)", color: "var(--muted)" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.COMPLETED;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 11px", borderRadius: 999, background: s.bg, color: s.color, font: "600 .7rem 'Hanken Grotesk'", textTransform: "capitalize" }}>
      {status.toLowerCase()}
    </span>
  );
}

export default function BookingsPanel() {
  const { token, toast } = useApp();
  const qc = useQueryClient();
  const [kind, setKind] = useState<"active" | "past">("active");

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", kind],
    queryFn: () => api<ApiBooking[]>(`/bookings/?status=${kind}`, { token: token ?? undefined }),
  });

  const cancelMutation = useMutation({
    mutationFn: (bid: number) => api<ApiBooking>(`/bookings/${bid}/cancel/`, { method: "POST", token: token ?? undefined }),
    onSuccess: () => {
      toast("Booking cancelled.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (e: Error) => toast(e.message),
  });

  const bookings = data ?? [];

  return (
    <div>
      <div style={{ display: "inline-flex", gap: 4, background: "var(--paper)", borderRadius: 999, padding: 4, marginBottom: 24 }}>
        {(["active", "past"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} style={{ height: 36, padding: "0 18px", border: "none", borderRadius: 999, font: "600 .85rem 'Hanken Grotesk'", cursor: "pointer", textTransform: "capitalize", background: kind === k ? "var(--surface)" : "transparent", color: kind === k ? "var(--ink)" : "var(--muted)", boxShadow: kind === k ? "var(--sh-sm)" : "none" }}>{k}</button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map((i) => <div key={i} className="sk" style={{ height: 104, borderRadius: "var(--r-md)" }} />)}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
          <h3 style={{ fontWeight: 600, fontSize: "1.25rem", color: "var(--ink)", margin: "0 0 8px" }}>No {kind} bookings yet</h3>
          <p style={{ color: "var(--muted)", margin: "0 auto 20px", maxWidth: "34ch" }}>{kind === "active" ? "When you book a session it shows up here." : "Past and cancelled sessions will appear here."}</p>
          <Link to="/#sessions" style={{ display: "inline-block", height: 44, lineHeight: "44px", padding: "0 22px", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .9rem 'Hanken Grotesk'", textDecoration: "none" }}>Browse sessions</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map((b) => {
            const s = mapSession(b.session);
            const canCancel = b.status === "ACTIVE" && kind === "active";
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 12 }}>
                <Link to={`/sessions/${s.id}`} style={{ flexShrink: 0, width: 92, height: 80, borderRadius: 12, overflow: "hidden", background: "var(--paper)" }}>
                  <img src={s.imgUrl} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <span className="mono" style={{ fontSize: ".64rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>{s.catLabel}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <Link to={`/sessions/${s.id}`} className="title-link" style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", textDecoration: "none" }}>{s.title}</Link>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", color: "var(--muted)", fontSize: ".8rem", marginTop: 5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Calendar />{s.date} · {s.time}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock />{s.dur}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{s.isOnline ? <Video /> : <Pin />}{s.location}</span>
                  </div>
                </div>
                {canCancel && (
                  <button onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending} className="close-btn" style={{ flexShrink: 0, height: 38, padding: "0 16px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--error)", font: "600 .82rem 'Hanken Grotesk'", cursor: "pointer" }}>Cancel</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
