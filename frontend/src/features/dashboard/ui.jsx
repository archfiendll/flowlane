import { Link } from "react-router-dom";

export function ChecklistItem({ done, label, hint, to }) {
  const body = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${done ? "#bbf7d0" : "#e2e8f0"}`,
        backgroundColor: done ? "#f0fdf4" : "#f8fafc",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: done ? "#16a34a" : "#e2e8f0",
            color: done ? "#fff" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {done ? "✓" : "•"}
        </div>
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 700, color: "#334155" }}>{label}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{hint}</p>
        </div>
      </div>
      {to ? <span style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>Open</span> : null}
    </div>
  );

  if (!to) return body;
  return <Link to={to} style={{ textDecoration: "none" }}>{body}</Link>;
}

export function ActivityRow({ label, value, tone = "neutral" }) {
  const tones = {
    neutral: { backgroundColor: "#f8fafc", color: "#475569", borderColor: "#e2e8f0" },
    warning: { backgroundColor: "#fffbeb", color: "#92400e", borderColor: "#fde68a" },
    success: { backgroundColor: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" },
    info: { backgroundColor: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" },
  };

  const style = tones[tone];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: style.color }}>{value}</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 18,
          padding: 24,
        }}
      >
        <div style={{ width: 190, height: 30, borderRadius: 10, backgroundColor: "#e2e8f0", marginBottom: 10 }} />
        <div style={{ width: 320, height: 14, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[1, 2, 3].map((card) => (
          <div key={card} style={{ minWidth: 180, padding: "20px 24px", borderRadius: 16, border: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
            <div style={{ width: 90, height: 10, borderRadius: 999, backgroundColor: "#f1f5f9", marginBottom: 12 }} />
            <div style={{ width: 56, height: 28, borderRadius: 10, backgroundColor: "#e2e8f0", marginBottom: 8 }} />
            <div style={{ width: 120, height: 12, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
        {[1, 2].map((panel) => (
          <div key={panel} style={{ minHeight: 220, borderRadius: 18, backgroundColor: "#fff", border: "1px solid #e2e8f0" }} />
        ))}
      </div>
    </div>
  );
}

export function formatDashboardDate(iso) {
  return iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

