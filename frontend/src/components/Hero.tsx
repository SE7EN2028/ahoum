import { useApp } from "../auth/AppContext";
import { img } from "../data/content";
import { Burger, Logo } from "../lib/icons";
import { PillButton } from "./ui";

const NAV = [
  ["#about", "About"],
  ["#sessions", "Sessions"],
  ["#practices", "Practices"],
  ["#stories", "Stories"],
  ["#faq", "FAQ"],
];

export default function Hero() {
  const { user, userName, userInitials, openLogin, toggleMenu, openMobile, scrollToSessions } = useApp();

  return (
    <section style={{ padding: "14px 14px 0" }}>
      <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", minHeight: "min(870px, 92vh)", background: "var(--green-deep)" }}>
        <img
          src={img("1600618528240-fb9fc964b853", 1600, 1400)}
          alt="A person seated in calm meditation in warm morning light"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
        />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(176deg, rgba(22,30,24,.62) 0%, rgba(22,30,24,.12) 22%, rgba(22,30,24,0) 44%, rgba(22,30,24,.2) 66%, rgba(22,30,24,.82) 100%)" }} />

        {/* top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px" }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", textDecoration: "none" }}>
            <Logo size={26} />
            <span style={{ fontWeight: 700, fontSize: "1.3rem", letterSpacing: "0.01em" }}>Ahoum</span>
          </a>

          <nav className="nav-desktop" style={{ alignItems: "center", gap: 4, background: "rgba(20,28,22,.34)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 999, padding: "6px 6px 6px 10px" }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="nav-link" style={{ color: "rgba(255,255,255,.86)", textDecoration: "none", font: "500 .9rem 'Hanken Grotesk'", padding: "8px 14px", borderRadius: 999 }}>
                {label}
              </a>
            ))}
            {!user ? (
              <button onClick={openLogin} className="u-lift-1" style={{ marginLeft: 4, height: 38, padding: "0 18px", border: "none", borderRadius: 999, background: "#fff", color: "var(--ink)", font: "600 .88rem 'Hanken Grotesk'", cursor: "pointer" }}>
                Log in
              </button>
            ) : (
              <button onClick={toggleMenu} style={{ marginLeft: 4, display: "flex", alignItems: "center", gap: 8, height: 38, padding: "3px 5px 3px 14px", border: "none", borderRadius: 999, background: "#fff", color: "var(--ink)", font: "600 .85rem 'Hanken Grotesk'", cursor: "pointer" }}>
                {userName}
                <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 999, background: "var(--green-deep)", color: "var(--lime)", font: "700 .72rem 'Hanken Grotesk'" }}>{userInitials}</span>
              </button>
            )}
          </nav>

          <button onClick={openMobile} className="nav-burger" aria-label="Open menu" style={{ width: 44, height: 44, border: "1px solid rgba(255,255,255,.28)", borderRadius: 999, background: "rgba(20,28,22,.34)", backdropFilter: "blur(10px)", color: "#fff", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Burger />
          </button>
        </div>

        {/* availability badge */}
        <div style={{ position: "absolute", top: 84, left: 30, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.14)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "7px 14px 7px 12px" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--lime)", boxShadow: "0 0 0 3px rgba(190,230,90,.25)" }} />
          <span className="mono" style={{ fontSize: ".68rem", letterSpacing: ".16em", textTransform: "uppercase", color: "#fff" }}>Available for sessions</span>
        </div>

        {/* bottom content */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3, padding: "34px 30px 30px" }}>
          <div className="hero-bottom">
            <h1 style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: "clamp(2.3rem,4.9vw,3.7rem)", lineHeight: 1.04, letterSpacing: "-.015em", maxWidth: "17ch", textWrap: "balance" }}>
              Thoughtful care for a quieter mind, guided gently.
            </h1>
            <div style={{ maxWidth: 300, flexShrink: 0 }}>
              <p style={{ color: "rgba(255,255,255,.82)", fontSize: ".98rem", lineHeight: 1.55, margin: "0 0 18px" }}>
                A gentle approach to wellness, with live sessions led by teachers you can trust.
              </p>
              <PillButton variant="white" onClick={scrollToSessions}>Browse sessions</PillButton>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26, gap: 16, flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: ".7rem", letterSpacing: ".12em", color: "rgba(255,255,255,.7)" }}>[ MUMBAI, IN · GMT+5:30 ]</span>
            <span className="mono" style={{ fontSize: ".7rem", letterSpacing: ".12em", color: "rgba(255,255,255,.7)" }}>[ ONLINE · ANYWHERE ]</span>
          </div>
        </div>
      </div>
    </section>
  );
}
