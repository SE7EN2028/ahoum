import { useApp } from "../auth/AppContext";
import { img } from "../data/content";
import { PillButton } from "./ui";

export default function BeginCTA() {
  const { scrollToSessions, openLogin } = useApp();
  return (
    <section className="wrap" style={{ paddingTop: 30, paddingBottom: 80 }}>
      <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", minHeight: 380, display: "flex", alignItems: "center", background: "var(--green-deep)" }}>
        <img src={img("1545389336-cf090694435e", 1400, 700)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(20,28,22,.9), rgba(20,28,22,.45))" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "48px 44px", maxWidth: "34ch" }}>
          <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "clamp(1.9rem,4vw,2.9rem)", lineHeight: 1.08, letterSpacing: "-.015em", margin: "0 0 16px" }}>Begin where you are.</h2>
          <p style={{ color: "rgba(255,255,255,.82)", fontSize: "1.05rem", lineHeight: 1.5, margin: "0 0 26px" }}>Your next quiet hour is already on the calendar. Find it, and let someone hold the space for you.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PillButton variant="white" onClick={scrollToSessions}>Browse sessions</PillButton>
            <button onClick={openLogin} className="icon-btn" style={{ height: 52, padding: "0 24px", border: "1px solid rgba(255,255,255,.35)", borderRadius: 999, background: "transparent", color: "#fff", font: "600 .95rem 'Hanken Grotesk'", cursor: "pointer" }}>Continue with Google</button>
          </div>
        </div>
      </div>
    </section>
  );
}
