import { useApp } from "../auth/AppContext";
import { featTags } from "../data/content";
import { PillButton } from "./ui";

export default function CalmCTA() {
  const { scrollToSessions } = useApp();
  return (
    <section style={{ paddingTop: 60, paddingBottom: 30 }}>
      <div className="wrap">
        <div style={{ background: "var(--green-deep)", borderRadius: 30, padding: "48px 44px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: 999, background: "radial-gradient(closest-side, rgba(190,230,90,.18), transparent)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "30ch" }}>
            <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "clamp(1.6rem,3.2vw,2.4rem)", lineHeight: 1.12, letterSpacing: "-.01em", margin: "0 0 14px" }}>One calm place for every kind of practice.</h2>
            <p style={{ color: "var(--on-green-mut)", fontSize: "1rem", lineHeight: 1.55, margin: "0 0 26px" }}>Whatever you are carrying today, there is a teacher and a session ready for it.</p>
            <PillButton variant="lime" onClick={scrollToSessions} height={50} circleSize={36} fontSize="0.92rem">Browse all sessions</PillButton>
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34 }}>
            {featTags.map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", height: 40, padding: "0 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.9)", font: "500 .9rem 'Hanken Grotesk'" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
