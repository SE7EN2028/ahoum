import { useState } from "react";
import { img, testimonials } from "../data/content";
import { ArrowLeft, ArrowRight } from "../lib/icons";
import { Eyebrow } from "./ui";

export default function Stories() {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const prev = () => setI((n) => (n - 1 + testimonials.length) % testimonials.length);
  const next = () => setI((n) => (n + 1) % testimonials.length);

  return (
    <section id="stories" style={{ paddingTop: 42, paddingBottom: 30, scrollMarginTop: 8 }}>
      <div className="wrap">
        <div style={{ background: "var(--green)", borderRadius: 30, padding: "56px 48px", position: "relative" }}>
          <Eyebrow label="Member stories" index="04" dark />
          <blockquote style={{ margin: 0, color: "#fff", fontWeight: 500, fontSize: "clamp(1.4rem,3vw,2.1rem)", lineHeight: 1.32, letterSpacing: "-.01em", maxWidth: "24ch" }}>“{t.q}”</blockquote>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img src={img(t.img, 360, 360)} alt="" style={{ width: 52, height: 52, borderRadius: 999, objectFit: "cover", border: "2px solid var(--lime)" }} />
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>{t.n}</div>
                <div style={{ color: "var(--on-green-mut)", fontSize: ".85rem" }}>{t.r}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="mono" style={{ color: "var(--on-green-mut)", fontSize: ".74rem", letterSpacing: ".1em" }}>{i + 1} / {testimonials.length}</span>
              <button onClick={prev} aria-label="Previous story" className="icon-btn" style={{ display: "grid", placeItems: "center", width: 46, height: 46, border: "1px solid rgba(255,255,255,.25)", borderRadius: 999, background: "transparent", color: "#fff", cursor: "pointer" }}><ArrowLeft /></button>
              <button onClick={next} aria-label="Next story" className="u-lift" style={{ display: "grid", placeItems: "center", width: 46, height: 46, border: "none", borderRadius: 999, background: "var(--lime)", color: "var(--ink)", cursor: "pointer" }}><ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
