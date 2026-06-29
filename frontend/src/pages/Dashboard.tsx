import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "../auth/AppContext";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import BookingsPanel from "../components/dashboard/BookingsPanel";
import ProfilePanel from "../components/dashboard/ProfilePanel";
import CreatorPanel from "../components/dashboard/CreatorPanel";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 36, paddingBottom: 64, minHeight: "62vh" }}>{children}</main>
      <Footer />
    </div>
  );
}

const LABEL: Record<string, string> = { sessions: "My sessions", bookings: "Bookings", profile: "Profile" };

export default function Dashboard() {
  const { user, authReady, openLogin } = useApp();
  const isCreator = user?.role === "CREATOR";
  const tabs = isCreator ? ["sessions", "bookings", "profile"] : ["bookings", "profile"];
  // null until the user picks; default derives from role (which loads async)
  const [tab, setTab] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !user) openLogin();
  }, [authReady, user, openLogin]);

  if (!authReady) {
    return <Shell><div className="sk" style={{ height: 300, borderRadius: "var(--r)" }} /></Shell>;
  }

  if (!user) {
    return (
      <Shell>
        <div style={{ textAlign: "center", maxWidth: 420, margin: "60px auto", padding: "48px 28px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
          <h1 style={{ fontWeight: 600, fontSize: "1.5rem", color: "var(--ink)", margin: "0 0 8px" }}>Sign in to view your dashboard</h1>
          <p style={{ color: "var(--muted)", margin: "0 auto 22px", maxWidth: "32ch" }}>Your bookings and profile live here once you're signed in.</p>
          <button onClick={openLogin} style={{ height: 48, padding: "0 24px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .92rem 'Hanken Grotesk'", cursor: "pointer" }}>Sign in</button>
        </div>
      </Shell>
    );
  }

  const activeTab = tab && tabs.includes(tab) ? tab : tabs[0];

  return (
    <Shell>
      <h1 style={{ fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.4rem)", letterSpacing: "-.015em", color: "var(--ink)", margin: "0 0 6px" }}>Your dashboard</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 26px" }}>Welcome back. {isCreator ? "Manage your sessions, bookings and profile." : "Your bookings and profile, all in one place."}</p>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 28, flexWrap: "wrap" }}>
        {tabs.map((t) => {
          const active = t === activeTab;
          return (
            <button key={t} onClick={() => setTab(t)} style={{ position: "relative", height: 44, padding: "0 16px", border: "none", background: "transparent", font: "600 .92rem 'Hanken Grotesk'", color: active ? "var(--ink)" : "var(--muted)", cursor: "pointer", borderBottom: active ? "2px solid var(--green-deep)" : "2px solid transparent", marginBottom: -1 }}>{LABEL[t]}</button>
          );
        })}
      </div>

      {activeTab === "sessions" && <CreatorPanel />}
      {activeTab === "bookings" && <BookingsPanel />}
      {activeTab === "profile" && <ProfilePanel />}
    </Shell>
  );
}
