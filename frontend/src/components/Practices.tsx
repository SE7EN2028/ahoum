import { useState } from "react";
import { useApp } from "../auth/AppContext";
import { img, practices } from "../data/content";
import { Plus } from "../lib/icons";
import { Eyebrow, PillButton } from "./ui";

export default function Practices() {
  const { scrollToSessions } = useApp();
  const [key, setKey] = useState(practices[0].k);
  const cur = practices.find((p) => p.k === key) || practices[0];

  return (
    <section id="practices" className="wrap" style={{ paddingTop: 72, paddingBottom: 30, scrollMarginTop: 8 }}>
      <Eyebrow label="Explore by practice" index="03" />

      <div className="disc-grid">
        {/* selected practice image card */}
        <div style={{ position: "relative", borderRadius: "var(--r)", overflow: "hidden", minHeight: 440, background: "var(--green-deep)" }}>
          <img src={img(cur.img, 760, 920)} alt={cur.l} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,28,22,.05), rgba(20,28,22,.8))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--lime)", color: "var(--ink)", font: "600 .74rem 'Hanken Grotesk'", padding: "5px 12px", borderRadius: 999, marginBottom: 12 }}>{cur.count} sessions</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", font: "500 .8rem 'Hanken Grotesk'" }}>Starting</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.7rem", lineHeight: 1.1 }}>
                  {cur.from === 0 ? "Free" : `₹${cur.from}`} {cur.from !== 0 && <span style={{ fontSize: ".86rem", fontWeight: 500, color: "rgba(255,255,255,.7)" }}>/ session</span>}
                </div>
              </div>
              <PillButton variant="white" onClick={scrollToSessions} height={46} padLeft={20} gap={9} circleSize={32} fontSize="0.88rem">View</PillButton>
            </div>
          </div>
        </div>

        {/* accordion */}
        <div>
          {practices.map((p, i) => {
            const open = p.k === key;
            return (
              <div key={p.k} style={{ borderBottom: "1px solid var(--line)", background: open ? "var(--paper)" : "transparent", borderRadius: open ? 14 : 0, transition: "background .26s var(--ease)", paddingLeft: 14, paddingRight: 14, marginLeft: -14, marginRight: -14 }}>
                <div onClick={() => setKey(p.k)} style={{ display: "flex", alignItems: "center", gap: 18, cursor: "pointer", padding: "22px 4px" }}>
                  <span className="mono" style={{ fontSize: ".8rem", color: open ? "var(--green)" : "var(--muted)", flexShrink: 0, width: 24 }}>0{i + 1}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: "1.35rem", letterSpacing: "-.01em", color: open ? "var(--ink)" : "var(--ink-2)" }}>{p.l}</span>
                  <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 999, border: `1px solid ${open ? "var(--green-deep)" : "var(--line-2)"}`, background: open ? "var(--green-deep)" : "transparent", color: open ? "#fff" : "var(--ink-2)", transition: "all .26s var(--ease)", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
                    <Plus />
                  </span>
                </div>
                {open && (
                  <div style={{ padding: "0 4px 24px 60px", animation: "fadeIn .3s ease both" }}>
                    <p style={{ margin: "0 0 14px", color: "var(--ink-2)", fontSize: "1rem", lineHeight: 1.55, maxWidth: "46ch" }}>{p.d}</p>
                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", font: "500 .82rem 'Hanken Grotesk'" }}><span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--lime-2)" }} />{p.dur}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", font: "500 .82rem 'Hanken Grotesk'" }}><span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--lime-2)" }} />{p.from === 0 ? "Free" : `from ₹${p.from}`}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
