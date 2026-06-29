import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../auth/AppContext";
import { Logo } from "../lib/icons";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { finishGoogle, toast } = useApp();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const denied = params.get("error");
    if (denied || !code) {
      setError("Sign in was cancelled.");
      return;
    }
    finishGoogle(code)
      .then(() => {
        toast("Signed in. Welcome to Ahoum.");
        navigate("/", { replace: true });
      })
      .catch((e) => setError(e.message || "Could not complete sign in."));
  }, [params, finishGoogle, navigate, toast]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--green-deep)" }}>
      <div style={{ textAlign: "center", color: "#fff", maxWidth: "34ch" }}>
        <div style={{ width: 60, height: 60, margin: "0 auto 22px", borderRadius: 999, background: "rgba(255,255,255,.1)", color: "var(--lime)", display: "grid", placeItems: "center" }}><Logo size={30} /></div>
        {!error ? (
          <>
            <span style={{ width: 22, height: 22, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "var(--lime)", borderRadius: 999, display: "inline-block", animation: "spinj .7s linear infinite", marginBottom: 18 }} />
            <h1 style={{ fontWeight: 600, fontSize: "1.5rem", margin: "0 0 8px" }}>Signing you in…</h1>
            <p style={{ color: "var(--on-green-mut)", margin: 0 }}>One quiet moment while we set up your space.</p>
          </>
        ) : (
          <>
            <h1 style={{ fontWeight: 600, fontSize: "1.5rem", margin: "0 0 8px" }}>We could not sign you in</h1>
            <p style={{ color: "var(--on-green-mut)", margin: "0 0 22px" }}>{error}</p>
            <button onClick={() => navigate("/", { replace: true })} className="u-lift" style={{ height: 48, padding: "0 24px", border: "none", borderRadius: 999, background: "var(--lime)", color: "var(--ink)", font: "600 .92rem 'Hanken Grotesk'", cursor: "pointer" }}>Back to Ahoum</button>
          </>
        )}
      </div>
    </div>
  );
}
