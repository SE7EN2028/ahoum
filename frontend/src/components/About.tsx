import { useState } from "react";
import { useApp } from "../auth/AppContext";
import { img, statData, statTabs } from "../data/content";
import { Star } from "../lib/icons";
import { Eyebrow, PillButton } from "./ui";

export default function About() {
  const { scrollToSessions } = useApp();
  const [tab, setTab] = useState("all");
  const cur = statData[tab] || statData.all;

  return (
    <section id="about" className="wrap" style={{ paddingTop: 80, paddingBottom: 30, scrollMarginTop: 10 }}>
      <Eyebrow label="About Ahoum" index="01" />

      <h2 style={{ fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.55rem)", lineHeight: 1.18, letterSpacing: "-.01em", color: "var(--ink)", margin: "0 0 44px", maxWidth: "24ch" }}>
        We treat wellness as a mindful practice, designed to support balance, clarity and a steadier everyday.
      </h2>

      <div className="about-grid">
        {/* testimonial image card */}
        <div style={{ position: "relative", borderRadius: "var(--r)", overflow: "hidden", minHeight: 360, background: "var(--green-deep)" }}>
          <img src={img("1544005313-94ddf0286df2", 700, 900)} alt="A member reflecting after a session" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,28,22,.15), rgba(20,28,22,.85))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 22 }}>
            <p style={{ color: "#fff", fontSize: "1.12rem", lineHeight: 1.4, fontWeight: 500, margin: "0 0 18px" }}>“This is the first practice that actually fit into my daily routine.”</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", gap: 2, color: "var(--lime)" }}><Star /></span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: ".95rem" }}>5.0</span>
              <span className="mono" style={{ color: "rgba(255,255,255,.65)", fontSize: ".66rem", letterSpacing: ".08em", textTransform: "uppercase", marginLeft: 4 }}>Member ratings</span>
            </div>
          </div>
        </div>

        <div className="about-right">
          <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="about-right">
            <div style={{ borderRadius: "var(--r)", overflow: "hidden", minHeight: 200 }}>
              <img src={img("1591228127791-8e2eaef098d3", 700, 560)} alt="Hands resting in a calm meditation pose by still water" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "6px 4px" }}>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.5, color: "var(--ink-2)", margin: "0 0 18px" }}>Join thousands finding a steadier rhythm through guided practice.</p>
              <PillButton variant="greenDeep" onClick={scrollToSessions} height={48} padLeft={22} gap={11} circleSize={34} fontSize="0.92rem" style={{ alignSelf: "flex-start" }}>Book now</PillButton>
            </div>
          </div>

          {/* lime stats card */}
          <div style={{ gridColumn: "1 / -1", background: "var(--lime)", borderRadius: "var(--r)", padding: "24px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--green-deep)" }}>Weekly practice time</span>
              <div style={{ display: "flex", gap: 4, background: "rgba(38,52,38,.1)", borderRadius: 999, padding: 3 }}>
                {statTabs.map(([k, l]) => {
                  const active = k === tab;
                  return (
                    <button key={k} onClick={() => setTab(k)} style={{ height: 28, padding: "0 12px", border: "none", borderRadius: 999, font: "600 .74rem 'Hanken Grotesk'", cursor: "pointer", transition: "all .2s var(--ease)", background: active ? "var(--green-deep)" : "transparent", color: active ? "var(--lime)" : "rgba(38,52,38,.6)" }}>
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
              <div style={{ fontWeight: 700, fontSize: "3.2rem", lineHeight: 1, color: "var(--green-deep)", letterSpacing: "-.02em" }}>{cur.h}</div>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 6, height: 84 }}>
                {cur.bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, minHeight: 10, borderRadius: 5, background: "var(--green-deep)", opacity: 0.9, transition: "height .4s var(--ease)" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <span className="mono" style={{ fontSize: ".62rem", color: "rgba(38,52,38,.65)" }}>MON</span>
              <span className="mono" style={{ fontSize: ".62rem", color: "rgba(38,52,38,.65)" }}>SUN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
