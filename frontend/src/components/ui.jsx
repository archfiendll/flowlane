import { Link } from "react-router-dom";

export function SurfaceCard({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        boxShadow: "0 10px 28px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, accentColor, to }) {
  const card = (
    <SurfaceCard
      style={{
        minWidth: 180,
        padding: "20px 22px",
        borderTop: `3px solid ${accentColor}`,
        transition: to ? "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease" : undefined,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>{value}</p>
      {sub ? <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{sub}</p> : null}
    </SurfaceCard>
  );

  if (!to) return card;

  return (
    <Link
      to={to}
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        const element = e.currentTarget.firstChild;
        if (element) {
          element.style.transform = "translateY(-2px)";
          element.style.boxShadow = "0 16px 32px rgba(15,23,42,0.08)";
          element.style.borderColor = "#bfdbfe";
        }
      }}
      onMouseLeave={(e) => {
        const element = e.currentTarget.firstChild;
        if (element) {
          element.style.transform = "translateY(0)";
          element.style.boxShadow = "0 10px 28px rgba(15,23,42,0.04)";
          element.style.borderColor = "#e2e8f0";
        }
      }}
    >
      {card}
    </Link>
  );
}

export function SectionPanel({ title, subtitle, children, style }) {
  return (
    <SurfaceCard style={{ padding: 22, ...style }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: 18, color: "#1e293b" }}>{title}</h2>
        {subtitle ? <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{subtitle}</p> : null}
      </div>
      {children}
    </SurfaceCard>
  );
}

export function StatusPill({ label, tone = "neutral", style }) {
  const tones = {
    neutral: { backgroundColor: "#f1f5f9", color: "#64748b", borderColor: "#e2e8f0" },
    info: { backgroundColor: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" },
    success: { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" },
    warning: { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fde68a" },
    danger: { backgroundColor: "#fee2e2", color: "#b91c1c", borderColor: "#fecaca" },
  };

  const colors = tones[tone] || tones.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        border: `1px solid ${colors.borderColor}`,
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

export function QuickLinkCard({ to, title, sub }) {
  return (
    <Link
      to={to}
      style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        const element = e.currentTarget.firstChild;
        if (element) {
          element.style.transform = "translateY(-2px)";
          element.style.borderColor = "#bfdbfe";
          element.style.boxShadow = "0 16px 32px rgba(15,23,42,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        const element = e.currentTarget.firstChild;
        if (element) {
          element.style.transform = "translateY(0)";
          element.style.borderColor = "#e2e8f0";
          element.style.boxShadow = "0 10px 28px rgba(15,23,42,0.04)";
        }
      }}
    >
      <SurfaceCard
        style={{
          display: "block",
          minWidth: 200,
          padding: "18px 20px",
          transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>{title} →</p>
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{sub}</p>
      </SurfaceCard>
    </Link>
  );
}
