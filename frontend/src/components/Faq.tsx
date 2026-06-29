import { useState } from "react";
import { faqs } from "../data/content";
import { Plus } from "../lib/icons";
import { Eyebrow } from "./ui";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="wrap" style={{ paddingTop: 72, paddingBottom: 40, scrollMarginTop: 8 }}>
      <Eyebrow label="Questions" index="05" />
      <div className="disc-grid">
        <h2 style={{ fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.5rem)", lineHeight: 1.12, letterSpacing: "-.01em", color: "var(--ink)", margin: 0, maxWidth: "14ch" }}>Questions, answered before you ask.</h2>
        <div>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left", padding: "22px 0", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)" }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: "1.12rem", letterSpacing: "-.005em" }}>{f.q}</span>
                  <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 999, background: isOpen ? "var(--green-deep)" : "var(--paper)", color: isOpen ? "#fff" : "var(--ink-2)", transition: "all .26s var(--ease)", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}><Plus /></span>
                </button>
                {isOpen && (
                  <p style={{ margin: 0, padding: "0 50px 24px 0", color: "var(--ink-2)", fontSize: "1rem", lineHeight: 1.6, animation: "fadeIn .3s ease both" }}>{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
