import type { EnrichedSession } from "../data/content";
import { ArrowRight, Calendar, Clock, Pin, Verified, Video } from "../lib/icons";

export default function SessionCard({ s, onBook }: { s: EnrichedSession; onBook: (s: EnrichedSession) => void }) {
  return (
    <article className="sess-card" style={{ display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
      <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden", background: "var(--paper)", margin: 10, marginBottom: 0, borderRadius: 12 }}>
        <img className="card-img" src={s.imgUrl} alt={s.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", height: 25, padding: "0 11px", borderRadius: 999, background: "rgba(255,255,255,.95)", color: "var(--green)", font: "600 .7rem 'Hanken Grotesk'" }}>{s.catLabel}</span>
        {s.soldOut && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(22,30,24,.5)", display: "grid", placeItems: "center" }}>
            <span style={{ background: "#fff", color: "var(--ink)", font: "600 .8rem 'Hanken Grotesk'", padding: "7px 16px", borderRadius: 999 }}>Sold out</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "var(--paper)", color: "var(--ink-2)", font: "700 .66rem 'Hanken Grotesk'", flexShrink: 0 }}>{s.initials}</span>
          <span style={{ font: "500 .82rem 'Hanken Grotesk'", color: "var(--muted)" }}>{s.creator}</span>
          {s.verified && <span aria-label="Verified teacher" style={{ color: "var(--green)", display: "flex" }}><Verified /></span>}
        </div>

        <a href="#sessions" className="title-link" style={{ fontWeight: 600, fontSize: "1.18rem", lineHeight: 1.18, color: "var(--ink)", textDecoration: "none", letterSpacing: "-.005em" }}>{s.title}</a>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", color: "var(--muted)", fontSize: ".82rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Calendar />{s.date} · {s.time}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock />{s.dur}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: ".82rem" }}>
          <span style={{ display: "inline-flex", color: "var(--ink-2)" }}>{s.isOnline ? <Video /> : <Pin />}</span>
          {s.location}
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.2rem", lineHeight: 1, color: s.isFree ? "var(--green)" : "var(--ink)" }}>{s.priceLabel}</div>
            {!s.soldOut ? (
              <div style={{ font: "600 .74rem 'Hanken Grotesk'", color: s.urgent ? "var(--green)" : "var(--muted)", marginTop: 5, fontWeight: s.urgent ? 600 : 500 }}>{s.seatText}</div>
            ) : (
              <div style={{ font: "600 .74rem 'Hanken Grotesk'", color: "var(--error)", marginTop: 5 }}>Sold out</div>
            )}
          </div>

          {s.bookable ? (
            <button onClick={() => onBook(s)} className="u-lift focus-lime" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 7px 0 16px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .82rem 'Hanken Grotesk'", cursor: "pointer", whiteSpace: "nowrap" }}>
              Book
              <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 999, background: "var(--lime)", color: "var(--ink)" }}><ArrowRight size={13} stroke={2.2} /></span>
            </button>
          ) : (
            <button disabled style={{ height: 40, padding: "0 16px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--paper)", color: "var(--muted)", font: "600 .82rem 'Hanken Grotesk'", cursor: "not-allowed" }}>Sold out</button>
          )}
        </div>
      </div>
    </article>
  );
}
