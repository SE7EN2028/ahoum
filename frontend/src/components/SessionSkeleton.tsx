// Loading placeholder shaped like a SessionCard.
export default function SessionSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
      <div className="sk" style={{ margin: 10, marginBottom: 0, aspectRatio: "16 / 10", borderRadius: 12 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
        <div className="sk" style={{ width: "45%", height: 14 }} />
        <div className="sk" style={{ width: "80%", height: 20 }} />
        <div className="sk" style={{ width: "60%", height: 12 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <div className="sk" style={{ width: 64, height: 22 }} />
          <div className="sk" style={{ width: 84, height: 40, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
