import { useApp } from "../auth/AppContext";
import { footerPractices } from "../data/content";
import { ArrowRight, Logo } from "../lib/icons";

const linkStyle = { display: "block", color: "rgba(255,255,255,.78)", font: "400 .9rem 'Hanken Grotesk'", textDecoration: "none", padding: "6px 0" } as const;
const colHead = { fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--on-green-mut)", marginBottom: 16 };

export default function Footer() {
  const { scrollToSessions } = useApp();
  return (
    <footer style={{ background: "oklch(0.18 0.014 155)", color: "var(--on-green)", paddingTop: 60, paddingBottom: 34 }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 36, paddingBottom: 46 }} className="feat-grid">
          <div style={{ minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", marginBottom: 14 }}><Logo size={24} /><span style={{ fontWeight: 700, fontSize: "1.25rem" }}>Ahoum</span></div>
            <p style={{ color: "var(--on-green-mut)", fontSize: ".92rem", lineHeight: 1.6, margin: "0 0 20px", maxWidth: "30ch" }}>Live sessions for a quieter mind, led by teachers you can trust.</p>
            <button onClick={scrollToSessions} style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 46, padding: "0 6px 0 20px", border: "none", borderRadius: 999, background: "var(--lime)", color: "var(--ink)", font: "600 .88rem 'Hanken Grotesk'", cursor: "pointer" }}>
              Browse sessions
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 999, background: "var(--green-deep)", color: "var(--lime)" }}><ArrowRight size={14} stroke={2} /></span>
            </button>
          </div>
          <div>
            <div className="mono" style={colHead}>Practices</div>
            {footerPractices.map((f) => (<a key={f} href="#practices" className="footer-link" style={linkStyle}>{f}</a>))}
          </div>
          <div>
            <div className="mono" style={colHead}>Ahoum</div>
            <a href="#about" className="footer-link" style={linkStyle}>About</a>
            <a href="#sessions" className="footer-link" style={linkStyle}>Sessions</a>
            <a href="#stories" className="footer-link" style={linkStyle}>Stories</a>
            <a href="#faq" className="footer-link" style={linkStyle}>FAQ</a>
          </div>
          <div>
            <div className="mono" style={colHead}>Support</div>
            <a href="#faq" className="footer-link" style={linkStyle}>Help centre</a>
            <a href="#top" className="footer-link" style={linkStyle}>Contact</a>
            <a href="#top" className="footer-link" style={linkStyle}>Trust &amp; safety</a>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,.12)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: 22 }}>
          <span style={{ color: "var(--on-green-mut)", fontSize: ".82rem" }}>© 2026 Ahoum · Sessions for a quieter mind</span>
          <div style={{ display: "flex", gap: 22 }}>
            <a href="#top" className="footer-link" style={{ color: "var(--on-green-mut)", fontSize: ".82rem", textDecoration: "none" }}>Privacy</a>
            <a href="#top" className="footer-link" style={{ color: "var(--on-green-mut)", fontSize: ".82rem", textDecoration: "none" }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
