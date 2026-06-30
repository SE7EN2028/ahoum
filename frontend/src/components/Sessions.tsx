import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { useApp } from "../auth/AppContext";
import { catDefs, modeDefs, type EnrichedSession } from "../data/content";
import { api, type ApiBooking, type ApiSession } from "../lib/api";
import { bookingErrorMessage, mapSession } from "../lib/sessions";
import { createCheckout } from "../lib/payments";
import { Search } from "../lib/icons";
import { Eyebrow } from "./ui";
import SessionCard from "./SessionCard";
import SessionSkeleton from "./SessionSkeleton";

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Sessions() {
  const { user, openLogin, toast } = useApp();
  const qc = useQueryClient();
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [mode, setMode] = useState("all");
  const grid = useRef<HTMLDivElement>(null);

  // debounce the search box so we don't refetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput), 250);
    return () => clearTimeout(t);
  }, [qInput]);

  const params = new URLSearchParams();
  if (cat !== "all") params.set("category", cat);
  if (mode !== "all") params.set("mode", mode);
  if (q.trim()) params.set("q", q.trim());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sessions", cat, mode, q],
    queryFn: () => api<ApiSession[]>(`/sessions/?${params.toString()}`),
    placeholderData: keepPreviousData,
  });

  // know which sessions the signed-in user already booked, to mark cards
  const { data: activeBookings } = useQuery({
    queryKey: ["bookings", "active"],
    queryFn: () => api<ApiBooking[]>("/bookings/?status=active", { auth: true }),
    enabled: !!user,
  });
  const bookedIds = new Set((activeBookings ?? []).map((b) => b.session.id));

  const filtered = (data ?? []).map(mapSession);
  const count = filtered.length;
  const filterKey = `${cat}|${mode}|${filtered.map((s) => s.id).join(",")}`;

  // GSAP: stagger the tiles in on load and on every result change.
  useGSAP(
    () => {
      if (prefersReduced() || isLoading) return;
      gsap.from(".sess-card", {
        opacity: 0,
        y: 16,
        scale: 0.97,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.045,
        clearProps: "opacity,transform",
      });
    },
    { scope: grid, dependencies: [filterKey, isLoading] },
  );

  const bookMutation = useMutation({
    mutationFn: (sessionId: number) =>
      api<ApiBooking>("/bookings/", { method: "POST", auth: true, body: { session_id: sessionId } }),
    onSuccess: () => {
      toast("Seat reserved. See you there.");
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: Error) => toast(bookingErrorMessage(err.message)),
  });

  const onBook = (s: EnrichedSession) => {
    if (!user) return openLogin();
    if (s.soldOut) return toast("Session not available.");
    if (s.isFree) {
      bookMutation.mutate(Number(s.id));
      return;
    }
    // paid session -> Stripe Checkout
    toast("Redirecting to secure checkout…");
    createCheckout(Number(s.id))
      .then((r) => { window.location.href = r.checkout_url; })
      .catch((e: Error) => toast(e.message));
  };

  const clearFilters = () => { setQInput(""); setQ(""); setCat("all"); setMode("all"); };

  const countLabel = isLoading
    ? "Finding sessions…"
    : isError
      ? "Sessions are unavailable right now"
      : count === 0
        ? "No sessions match your filters"
        : `${count} session${count === 1 ? "" : "s"} you can join this week`;

  return (
    <section id="sessions" className="wrap" style={{ paddingTop: 72, paddingBottom: 30, scrollMarginTop: 8 }}>
      <Eyebrow label="Upcoming sessions" index="02" />

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 26 }}>
        <h2 style={{ fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.55rem)", lineHeight: 1.1, letterSpacing: "-.01em", color: "var(--ink)", margin: 0, maxWidth: "18ch" }}>Find a session that fits your week.</h2>
        <p style={{ color: "var(--muted)", fontSize: ".96rem", margin: 0, maxWidth: "30ch" }}>{countLabel}</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "7px 7px 7px 18px", boxShadow: "var(--sh-sm)", marginBottom: 18, maxWidth: 560 }}>
        <span aria-hidden style={{ color: "var(--muted)", display: "flex" }}><Search /></span>
        <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search sessions, teachers or topics" aria-label="Search sessions" style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", font: "400 .98rem 'Hanken Grotesk'", color: "var(--ink)", padding: "8px 0" }} />
        <button type="submit" className="search-btn focus-lime" style={{ height: 42, padding: "0 22px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .88rem 'Hanken Grotesk'", cursor: "pointer", whiteSpace: "nowrap" }}>Search</button>
      </form>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          {catDefs.map(([k, l]) => {
            const active = k === cat;
            return (
              <button key={k} onClick={() => setCat(k)} className={active ? "" : "chip-idle"} style={{ display: "inline-flex", alignItems: "center", height: 38, padding: "0 17px", borderRadius: 999, font: "500 .88rem 'Hanken Grotesk'", cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s var(--ease)", border: active ? "1px solid var(--green-deep)" : "1px solid var(--line-2)", background: active ? "var(--green-deep)" : "var(--surface)", color: active ? "var(--on-green)" : "var(--ink-2)" }}>
                {l}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--paper)", borderRadius: 999, padding: 4 }}>
          {modeDefs.map(([k, l]) => {
            const active = k === mode;
            return (
              <button key={k} onClick={() => setMode(k)} style={{ height: 34, padding: "0 15px", border: "none", borderRadius: 999, font: "600 .82rem 'Hanken Grotesk'", cursor: "pointer", transition: "all .2s var(--ease)", background: active ? "var(--surface)" : "transparent", color: active ? "var(--ink)" : "var(--muted)", boxShadow: active ? "var(--sh-sm)" : "none" }}>
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="sess-grid">
          {Array.from({ length: 8 }).map((_, i) => <SessionSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div style={{ textAlign: "center", padding: "60px 24px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
          <h3 style={{ fontWeight: 600, fontSize: "1.4rem", color: "var(--ink)", margin: "0 0 8px" }}>Sessions are not available right now</h3>
          <p style={{ color: "var(--muted)", margin: "0 auto 20px", maxWidth: "36ch" }}>We could not reach the schedule. Check your connection and try again.</p>
          <button onClick={() => refetch()} className="google-btn" style={{ height: 44, padding: "0 22px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .9rem 'Hanken Grotesk'", cursor: "pointer" }}>Try again</button>
        </div>
      ) : count > 0 ? (
        <div ref={grid} className="sess-grid">
          {filtered.map((s) => (
            <SessionCard key={s.id} s={s} onBook={onBook} owned={!!user && s.creatorId === user.id} booked={bookedIds.has(Number(s.id))} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 24px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
          <div style={{ width: 56, height: 56, margin: "0 auto 16px", borderRadius: 999, background: "var(--paper)", display: "grid", placeItems: "center", color: "var(--muted)" }}><Search size={24} /></div>
          <h3 style={{ fontWeight: 600, fontSize: "1.4rem", color: "var(--ink)", margin: "0 0 8px" }}>No sessions match just yet</h3>
          <p style={{ color: "var(--muted)", margin: "0 auto 20px", maxWidth: "36ch" }}>Try a different practice or format. New sessions are added every week.</p>
          <button onClick={clearFilters} className="google-btn" style={{ height: 44, padding: "0 22px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .9rem 'Hanken Grotesk'", cursor: "pointer" }}>Clear filters</button>
        </div>
      )}
    </section>
  );
}
