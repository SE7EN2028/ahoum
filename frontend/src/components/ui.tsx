import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "../lib/icons";

export function CircleArrow({ bg, color, size = 38, arrow = 16, stroke = 1.9 }: { bg: string; color: string; size?: number; arrow?: number; stroke?: number }) {
  return (
    <span style={{ display: "grid", placeItems: "center", width: size, height: size, borderRadius: 999, background: bg, color }}>
      <ArrowRight size={arrow} stroke={stroke} />
    </span>
  );
}

type Variant = "white" | "greenDeep" | "lime";
const VARIANTS: Record<Variant, { bg: string; color: string; circleBg: string; arrowColor: string }> = {
  white: { bg: "#fff", color: "var(--ink)", circleBg: "var(--green-deep)", arrowColor: "var(--lime)" },
  greenDeep: { bg: "var(--green-deep)", color: "var(--on-green)", circleBg: "var(--lime)", arrowColor: "var(--ink)" },
  lime: { bg: "var(--lime)", color: "var(--ink)", circleBg: "var(--green-deep)", arrowColor: "var(--lime)" },
};

export function PillButton({
  children,
  onClick,
  variant = "white",
  height = 52,
  padLeft = 24,
  gap = 12,
  circleSize = 38,
  fontSize = "0.95rem",
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  height?: number;
  padLeft?: number;
  gap?: number;
  circleSize?: number;
  fontSize?: string;
  style?: CSSProperties;
}) {
  const v = VARIANTS[variant];
  return (
    <button
      onClick={onClick}
      className="u-lift focus-green"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        height,
        padding: `0 7px 0 ${padLeft}px`,
        border: "none",
        borderRadius: 999,
        background: v.bg,
        color: v.color,
        font: `600 ${fontSize} 'Hanken Grotesk'`,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
      <CircleArrow bg={v.circleBg} color={v.arrowColor} size={circleSize} arrow={Math.round(circleSize * 0.42)} stroke={2} />
    </button>
  );
}

export function Eyebrow({ label, index, dark = false }: { label: string; index: string; dark?: boolean }) {
  const c = dark ? "var(--on-green-mut)" : "var(--muted)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: dark ? "none" : "1px solid var(--line)",
        paddingTop: dark ? 0 : 16,
        marginBottom: dark ? 30 : 36,
      }}
    >
      <span className="mono" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: c }}>
        / {label}
      </span>
      <span className="mono" style={{ fontSize: "0.72rem", letterSpacing: "0.1em", color: c }}>
        [ {index} ]
      </span>
    </div>
  );
}
