import { Link } from "react-router-dom";
import { useApp } from "../auth/AppContext";
import { Burger, Logo } from "../lib/icons";

const NAV = [
  ["/#about", "About"],
  ["/#sessions", "Sessions"],
  ["/#practices", "Practices"],
  ["/#stories", "Stories"],
  ["/#faq", "FAQ"],
];

/** Solid header for inner routes (detail, dashboards). The landing keeps its
 * own header overlaid on the hero. */
export default function SiteHeader() {
  const { user, userName, userInitials, openLogin, toggleMenu, openMobile } = useApp();

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "color-mix(in oklab, var(--bg) 88%, transparent)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink)", textDecoration: "none" }}>
          <Logo size={24} />
          <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>Ahoum</span>
        </Link>

        <nav className="nav-desktop" style={{ alignItems: "center", gap: 2 }}>
          {NAV.map(([href, label]) => (
            <a key={href} href={href} style={{ color: "var(--ink-2)", textDecoration: "none", font: "500 .9rem 'Hanken Grotesk'", padding: "8px 14px", borderRadius: 999 }} className="menu-link">
              {label}
            </a>
          ))}
          {!user ? (
            <button onClick={openLogin} className="u-lift-1" style={{ marginLeft: 6, height: 40, padding: "0 18px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .88rem 'Hanken Grotesk'", cursor: "pointer" }}>Log in</button>
          ) : (
            <button onClick={toggleMenu} style={{ marginLeft: 6, display: "flex", alignItems: "center", gap: 8, height: 40, padding: "3px 5px 3px 14px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .85rem 'Hanken Grotesk'", cursor: "pointer" }}>
              {userName}
              <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 999, background: "var(--green-deep)", color: "var(--lime)", font: "700 .72rem 'Hanken Grotesk'" }}>{userInitials}</span>
            </button>
          )}
        </nav>

        <button onClick={openMobile} className="nav-burger" aria-label="Open menu" style={{ width: 44, height: 44, border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Burger />
        </button>
      </div>
    </header>
  );
}
