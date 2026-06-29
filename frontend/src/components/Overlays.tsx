import type { MouseEvent } from "react";
import { useApp } from "../auth/AppContext";
import { Check, Close, GoogleG, Logo } from "../lib/icons";

const stop = (e: MouseEvent) => e.stopPropagation();
const NAV = [["#about", "About"], ["#sessions", "Sessions"], ["#practices", "Practices"], ["#stories", "Stories"], ["#faq", "FAQ"]];

export default function Overlays() {
  const app = useApp();

  return (
    <>
      {/* account menu */}
      {app.menuOpen && app.user && (
        <div onClick={app.closeMenu} style={{ position: "fixed", inset: 0, zIndex: 55 }}>
          <div onClick={stop} style={{ position: "absolute", top: 74, right: 30, width: 190, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "var(--sh-lg)", padding: 7 }}>
            <a href="#sessions" onClick={app.closeMenu} className="menu-link" style={{ display: "block", padding: "10px 12px", borderRadius: 9, color: "var(--ink)", textDecoration: "none", font: "500 .9rem 'Hanken Grotesk'" }}>Your dashboard</a>
            <a href="#about" onClick={app.closeMenu} className="menu-link" style={{ display: "block", padding: "10px 12px", borderRadius: 9, color: "var(--ink)", textDecoration: "none", font: "500 .9rem 'Hanken Grotesk'" }}>Profile</a>
            <div style={{ height: 1, background: "var(--line)", margin: "5px 8px" }} />
            <button onClick={app.logout} className="logout-link" style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "none", borderRadius: 9, background: "transparent", color: "var(--error)", font: "500 .9rem 'Hanken Grotesk'", cursor: "pointer" }}>Log out</button>
          </div>
        </div>
      )}

      {/* mobile menu */}
      {app.mobileOpen && (
        <div onClick={app.closeMobile} style={{ position: "fixed", inset: 0, background: "rgba(20,28,22,.5)", zIndex: 60, animation: "fadeIn .2s ease both" }}>
          <div onClick={stop} style={{ position: "absolute", top: 14, left: 14, right: 14, background: "var(--surface)", borderRadius: 24, padding: "22px 22px 26px", boxShadow: "var(--sh-lg)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}><Logo size={22} /><span style={{ fontWeight: 700, fontSize: "1.2rem" }}>Ahoum</span></div>
              <button onClick={app.closeMobile} aria-label="Close menu" style={{ width: 40, height: 40, border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", display: "grid", placeItems: "center", cursor: "pointer" }}><Close /></button>
            </div>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} onClick={app.closeMobile} style={{ display: "block", fontWeight: 600, fontSize: "1.3rem", color: "var(--ink)", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>{label}</a>
            ))}
            {!app.user ? (
              <button onClick={app.openLogin} style={{ width: "100%", marginTop: 18, height: 50, border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .95rem 'Hanken Grotesk'", cursor: "pointer" }}>Log in</button>
            ) : (
              <button onClick={app.logout} style={{ width: "100%", marginTop: 18, height: 50, border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--error)", font: "600 .95rem 'Hanken Grotesk'", cursor: "pointer" }}>Log out</button>
            )}
          </div>
        </div>
      )}

      {/* login modal */}
      {app.loginOpen && (
        <div onClick={app.closeLogin} style={{ position: "fixed", inset: 0, background: "rgba(20,28,22,.5)", backdropFilter: "blur(3px)", zIndex: 70, display: "grid", placeItems: "center", padding: 24, animation: "fadeIn .22s ease both" }}>
          <div onClick={stop} style={{ width: "100%", maxWidth: 408, background: "var(--surface)", borderRadius: 26, boxShadow: "var(--sh-lg)", padding: "38px 34px 30px", textAlign: "center", position: "relative", animation: "fadeUp .3s var(--ease) both" }}>
            <button onClick={app.closeLogin} aria-label="Close" className="close-btn" style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, border: "none", borderRadius: 999, background: "var(--paper)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Close size={17} /></button>
            <div style={{ width: 60, height: 60, margin: "0 auto 20px", borderRadius: 999, background: "var(--green-deep)", color: "var(--lime)", display: "grid", placeItems: "center" }}><Logo size={30} /></div>
            <h3 style={{ fontWeight: 700, fontSize: "1.6rem", color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-.01em" }}>Welcome to Ahoum</h3>
            <p style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.5, margin: "0 0 24px" }}>Sign in to book sessions, save your practice and pick up where you left off.</p>
            <button onClick={app.signIn} disabled={app.signingIn} className="google-btn focus-green" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 11, width: "100%", height: 52, border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .95rem 'Hanken Grotesk'", cursor: app.signingIn ? "default" : "pointer" }}>
              {app.signingIn ? (
                <>
                  <span style={{ width: 18, height: 18, border: "2px solid var(--line-2)", borderTopColor: "var(--green)", borderRadius: 999, display: "inline-block", animation: "spinj .7s linear infinite" }} />
                  Signing you in…
                </>
              ) : (
                <>
                  <GoogleG />
                  Continue with Google
                </>
              )}
            </button>
            <p style={{ color: "var(--muted)", fontSize: ".78rem", lineHeight: 1.5, margin: "18px 0 0" }}>By continuing you agree to Ahoum’s <a href="#top" style={{ color: "var(--ink-2)", textDecoration: "underline", textUnderlineOffset: 2 }}>Terms</a> and <a href="#top" style={{ color: "var(--ink-2)", textDecoration: "underline", textUnderlineOffset: 2 }}>Privacy Policy</a>.</p>
          </div>
        </div>
      )}

      {/* toast */}
      {app.toastMsg && (
        <div role="status" style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 80, display: "flex", alignItems: "center", gap: 11, background: "var(--ink)", color: "#fff", padding: "13px 20px", borderRadius: 999, boxShadow: "var(--sh-lg)", font: "500 .9rem 'Hanken Grotesk'", animation: "fadeUp .3s var(--ease) both", maxWidth: "90vw" }}>
          <span style={{ display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "var(--lime)", color: "var(--ink)", flexShrink: 0 }}><Check /></span>
          {app.toastMsg}
        </div>
      )}
    </>
  );
}
