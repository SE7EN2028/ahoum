import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useApp } from "../auth/AppContext";
import { catDefs, enrich, modeDefs, sessions, type EnrichedSession } from "../data/content";
import { Search } from "../lib/icons";
import { Eyebrow } from "./ui";
import SessionCard from "./SessionCard";

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Sessions() {
  const { user, openLogin, toast } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [mode, setMode] = useState("all");
  const grid = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return sessions
      .filter((s) => (cat === "all" || s.cat === cat) && (mode === "all" || s.mode === mode) && (!ql || `${s.title} ${s.creator} ${s.catLabel}`.toLowerCase().includes(ql)))
      .map(enrich);
  }, [q, cat, mode]);

  const filterKey = `${cat}|${mode}|${filtered.map((s) => s.id).join(",")}`;

  // GSAP: stagger the tiles in on load and on every filter change.
  // gsap.from() keeps the natural state visible, so content never gates on the
  // animation running; clearProps wipes inline styles once it settles.
  useGSAP(
    () => {
      if (prefersReduced()) return; // cards stay visible, no motion
      gsap.from(".sess-card", {
        opacity: 0,
        y: 16,
        scale: 0.97,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.045,
        clearProps: "opacity,transform",
      });
    },
    { scope: grid, dependencies: [filterKey] },
  );

  const count = filtered.length;
  const countLabel = count === 0 ? "No sessions match your filters" : `${count} session${count === 1 ? "" : "s"} you can join this week`;

  const onBook = (s: EnrichedSession) => {
    if (!user) return openLogin();
    toast(s.price > 0 ? "Opening secure checkout…" : "Seat reserved. See you there.");
  };
  const clearFilters = () => { setQ(""); setCat("all"); setMode("all"); };

  return (
    <section id="sessions" className="wrap" style={{ paddingTop: 72, paddingBottom: 30, scrollMarginTop: 8 }}>
      <Eyebrow label="Upcoming sessions" index="02" />

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 26 }}>
        <h2 style={{ fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.55rem)", lineHeight: 1.1, letterSpacing: "-.01em", color: "var(--ink)", margin: 0, maxWidth: "18ch" }}>Find a session that fits your week.</h2>
        <p style={{ color: "var(--muted)", fontSize: ".96rem", margin: 0, maxWidth: "30ch" }}>{countLabel}</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "7px 7px 7px 18px", boxShadow: "var(--sh-sm)", marginBottom: 18, maxWidth: 560 }}>
        <span aria-hidden style={{ color: "var(--muted)", display: "flex" }}><Search /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sessions, teachers or topics" aria-label="Search sessions" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", font: "400 .98rem 'Hanken Grotesk'", color: "var(--ink)", padding: "8px 0" }} />
        <button type="submit" className="search-btn focus-lime" style={{ height: 42, padding: "0 22px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .88rem 'Hanken Grotesk'", cursor: "pointer", whiteSpace: "nowrap" }}>Search</button>
      </form>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {catDefs.map(([k, l]) => {
            const active = k === cat;
            return (
              <button key={k} onClick={() => setCat(k)} className={active ? "" : "chip-idle"} style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 17px", borderRadius: 999, font: "500 .88rem 'Hanken Grotesk'", cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s var(--ease)", border: active ? "1px solid var(--green-deep)" : "1px solid var(--line-2)", background: active ? "var(--green-deep)" : "var(--surface)", color: active ? "var(--on-green)" : "var(--ink-2)" }}>
                {l}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--paper)", borderRadius: 999, padding: 4 }}>
          {modeDefs.map(([k, l]) => {
            const active = k === mode;
            return (
              <button key={k} onClick={() => setMode(k)} style={{ height: 34, padding: "0 15px", border: "none", borderRadius: 999, font: "600 .82rem 'Hanken Grotesk'", cursor: "pointer", transition: "all .2s var(--ease)", background: active ? "var(--surface)" : "transparent", color: active ? "var(--ink)" : "var(--muted)", boxShadow: active ? "var(--sh-sm)" : "none" }}>
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {count > 0 ? (
        <div ref={grid} className="sess-grid">
          {filtered.map((s) => (
            <SessionCard key={s.id} s={s} onBook={onBook} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 24px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 16px", borderRadius: 999, background: "var(--paper)", display: "grid", placeItems: "center", color: "var(--muted)" }}><Search size={24} /></div>
          <h3 style={{ fontWeight: 600, fontSize: "1.4rem", color: "var(--ink)", margin: "0 0 8px" }}>No sessions match just yet</h3>
          <p style={{ color: "var(--muted)", margin: "0 auto 20px", maxWidth: "36ch" }}>Try a different practice or format. New sessions are added every week.</p>
          <button onClick={clearFilters} className="google-btn" style={{ height: 44, padding: "0 22px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .9rem 'Hanken Grotesk'", cursor: "pointer" }}>Clear filters</button>
        </div>
      )}
    </section>
  );
}
