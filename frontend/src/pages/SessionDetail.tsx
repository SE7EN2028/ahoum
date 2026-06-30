import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../auth/AppContext";
import { api, type ApiBooking, type ApiSession } from "../lib/api";
import { bookingErrorMessage, mapSession } from "../lib/sessions";
import { confirmPayment, createCheckout } from "../lib/payments";
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Close, Pin, Verified, Video } from "../lib/icons";
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 28, paddingBottom: 64, minHeight: "62vh" }}>{children}</main>
      <Footer />
    </div>
  );
}

function NotAvailable() {
  return (
    <div style={{ textAlign: "center", maxWidth: 460, margin: "60px auto", padding: "48px 28px", border: "1px dashed var(--line-2)", borderRadius: "var(--r)", background: "var(--surface)" }}>
      <div style={{ width: 60, height: 60, margin: "0 auto 18px", borderRadius: 999, background: "var(--paper)", display: "grid", placeItems: "center", color: "var(--muted)" }}><Close size={26} /></div>
      <h1 style={{ fontWeight: 600, fontSize: "1.6rem", color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-.01em" }}>Session not available</h1>
      <p style={{ color: "var(--muted)", margin: "0 auto 22px", maxWidth: "36ch" }}>This session may have been removed, unpublished, or is no longer open for booking.</p>
      <Link to="/#sessions" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 48, padding: "0 7px 0 22px", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .92rem 'Hanken Grotesk'", textDecoration: "none" }}>
        Browse sessions
        <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 999, background: "var(--lime)", color: "var(--ink)" }}><ArrowRight size={14} stroke={2} /></span>
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail-grid" style={{ marginTop: 16 }}>
      <div className="sk" style={{ aspectRatio: "4 / 3", borderRadius: "var(--r)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="sk" style={{ width: "40%", height: 16 }} />
        <div className="sk" style={{ width: "85%", height: 34 }} />
        <div className="sk" style={{ width: "60%", height: 16 }} />
        <div className="sk" style={{ width: "70%", height: 16 }} />
        <div className="sk" style={{ width: 140, height: 52, borderRadius: 999, marginTop: 8 }} />
      </div>
    </div>
  );
}

const MetaRow = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-2)", fontSize: ".95rem" }}>
    <span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 999, background: "var(--paper)", color: "var(--green)", flexShrink: 0 }}>{icon}</span>
    {children}
  </div>
);

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openLogin, toast } = useApp();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["session", id],
    queryFn: () => api<ApiSession>(`/sessions/${id}/`),
    retry: false,
  });

  const { data: activeBookings } = useQuery({
    queryKey: ["bookings", "active"],
    queryFn: () => api<ApiBooking[]>("/bookings/?status=active", { auth: true }),
    enabled: !!user,
  });
  const isBooked = !!activeBookings?.some((b) => b.session.id === Number(id));

  const bookMutation = useMutation({
    mutationFn: () => api<ApiBooking>("/bookings/", { method: "POST", auth: true, body: { session_id: Number(id) } }),
    onSuccess: () => {
      toast("Seat reserved. See you there.");
      qc.invalidateQueries({ queryKey: ["session", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err: Error) => toast(bookingErrorMessage(err.message)),
  });

  // Stripe redirect + return handling
  const [params, setParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const handledReturn = useRef(false);

  useEffect(() => {
    if (handledReturn.current) return;
    const pay = params.get("payment");
    const cs = params.get("cs");
    if (!pay) return;
    handledReturn.current = true;
    if (pay === "success" && cs) {
      setConfirming(true);
      confirmPayment(cs)
        .then((res) => {
          toast(res.booked ? "Payment received. Your seat is booked." : "Payment processing — your seat will appear shortly.");
          qc.invalidateQueries({ queryKey: ["session", id] });
          qc.invalidateQueries({ queryKey: ["bookings"] });
          qc.invalidateQueries({ queryKey: ["sessions"] });
        })
        .catch((e: Error) => toast(e.message))
        .finally(() => { setConfirming(false); setParams({}, { replace: true }); });
    } else if (pay === "cancelled") {
      toast("Payment cancelled. No booking made.");
      setParams({}, { replace: true });
    }
  }, [params, id, qc, toast, setParams]);

  if (isLoading) return <Shell><DetailSkeleton /></Shell>;
  if (isError || !data) return <Shell><NotAvailable /></Shell>;

  const s = mapSession(data);
  const owned = !!user && data.creator.id === user.id;

  const book = () => {
    if (!user) return openLogin();
    if (s.soldOut) return toast("Session not available.");
    if (s.isFree) {
      bookMutation.mutate();
      return;
    }
    // paid session -> Stripe Checkout
    setRedirecting(true);
    createCheckout(Number(id))
      .then((r) => { window.location.href = r.checkout_url; })
      .catch((e: Error) => { toast(e.message); setRedirecting(false); });
  };

  return (
    <Shell>
      <Link to="/#sessions" className="title-link" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--muted)", textDecoration: "none", font: "500 .9rem 'Hanken Grotesk'", marginBottom: 22 }}>
        <ArrowLeft size={16} /> All sessions
      </Link>

      <div className="detail-grid">
        {/* image */}
        <div style={{ position: "relative", borderRadius: "var(--r)", overflow: "hidden", aspectRatio: "4 / 3", background: "var(--green-deep)" }}>
          <img src={s.imgUrl} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <span style={{ position: "absolute", top: 14, left: 14, display: "inline-flex", alignItems: "center", height: 28, padding: "0 13px", borderRadius: 999, background: "rgba(255,255,255,.95)", color: "var(--green)", font: "600 .76rem 'Hanken Grotesk'" }}>{s.catLabel}</span>
          {s.soldOut && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(22,30,24,.5)", display: "grid", placeItems: "center" }}>
              <span style={{ background: "#fff", color: "var(--ink)", font: "600 .9rem 'Hanken Grotesk'", padding: "9px 20px", borderRadius: 999 }}>Sold out</span>
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 999, background: "var(--paper)", color: "var(--ink-2)", font: "700 .74rem 'Hanken Grotesk'" }}>{s.initials}</span>
            <span style={{ font: "500 .95rem 'Hanken Grotesk'", color: "var(--ink-2)" }}>{s.creator}</span>
            {s.verified && <span aria-label="Verified teacher" style={{ color: "var(--green)", display: "flex" }}><Verified size={16} /></span>}
          </div>

          <h1 style={{ fontWeight: 600, fontSize: "clamp(1.8rem,3.4vw,2.6rem)", lineHeight: 1.1, letterSpacing: "-.015em", color: "var(--ink)", margin: "0 0 22px", textWrap: "balance" }}>{s.title}</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <MetaRow icon={<Calendar size={16} />}>{s.date} · {s.time}</MetaRow>
            <MetaRow icon={<Clock size={16} />}>{s.dur}</MetaRow>
            <MetaRow icon={s.isOnline ? <Video size={16} /> : <Pin size={16} />}>{s.location}</MetaRow>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 22 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "2rem", lineHeight: 1, color: s.isFree ? "var(--green)" : "var(--ink)" }}>{s.priceLabel}</div>
              <div style={{ font: "600 .82rem 'Hanken Grotesk'", color: s.soldOut ? "var(--error)" : s.urgent ? "var(--green)" : "var(--muted)", marginTop: 6 }}>{s.seatText}</div>
            </div>
          </div>

          {/* booking action */}
          {confirming && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 16px", borderRadius: 999, background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)", font: "500 .88rem 'Hanken Grotesk'" }}>
              <span style={{ width: 16, height: 16, border: "2px solid var(--line-2)", borderTopColor: "var(--green)", borderRadius: 999, display: "inline-block", animation: "spinj .7s linear infinite" }} />
              Confirming your payment…
            </div>
          )}
          {owned ? (
            <Link to="/dashboard" className="u-lift" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 24px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--ink)", font: "600 .95rem 'Hanken Grotesk'", textDecoration: "none" }}>
              Your session · Manage
            </Link>
          ) : isBooked ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 22px", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .95rem 'Hanken Grotesk'" }}>
              <span style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 999, background: "var(--lime)", color: "var(--ink)" }}><Check /></span>
              You have a seat
            </div>
          ) : s.soldOut ? (
            <button disabled style={{ height: 52, padding: "0 26px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--paper)", color: "var(--muted)", font: "600 .95rem 'Hanken Grotesk'", cursor: "not-allowed" }}>Session not available</button>
          ) : (
            <button onClick={book} disabled={bookMutation.isPending || redirecting} className="u-lift focus-lime" style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 52, padding: "0 7px 0 26px", border: "none", borderRadius: 999, background: "var(--green-deep)", color: "var(--on-green)", font: "600 .95rem 'Hanken Grotesk'", cursor: bookMutation.isPending || redirecting ? "default" : "pointer" }}>
              {redirecting ? "Redirecting to checkout…" : bookMutation.isPending ? "Booking…" : "Book now"}
              <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 999, background: "var(--lime)", color: "var(--ink)" }}><ArrowRight size={16} stroke={2} /></span>
            </button>
          )}
          {!user ? (
            <p style={{ color: "var(--muted)", fontSize: ".82rem", margin: "12px 0 0" }}>You'll be asked to sign in first.</p>
          ) : !owned && !isBooked && s.isPaid ? (
            <p style={{ color: "var(--muted)", fontSize: ".82rem", margin: "12px 0 0" }}>Secure payment via Stripe. You'll be booked once payment succeeds.</p>
          ) : null}

          {/* description */}
          {s.title && (
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
              <h2 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--ink)", margin: "0 0 10px" }}>About this session</h2>
              <p style={{ color: "var(--ink-2)", fontSize: "1rem", lineHeight: 1.6, margin: 0, maxWidth: "60ch" }}>{data.description || "A live, guided session with your teacher. Come as you are."}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <button onClick={() => navigate("/#sessions")} className="google-btn" style={{ height: 44, padding: "0 22px", border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--ink)", font: "600 .9rem 'Hanken Grotesk'", cursor: "pointer" }}>← Back to all sessions</button>
      </div>
    </Shell>
  );
}
