import { Link } from "react-router-dom";

export function SurfaceCard({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #efefef",
        borderRadius: 16,
        boxShadow: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, to }) {
  const card = (
    <SurfaceCard
      style={{
        minWidth: 180,
        padding: "20px 22px",
        transition: to ? "transform 0.15s ease, border-color 0.15s ease" : undefined,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#6b6b6b",
          letterSpacing: "0",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: "#111111", margin: "0 0 6px 0" }}>{value}</p>
      {sub ? <p style={{ fontSize: 12, color: "#6b6b6b", margin: 0 }}>{sub}</p> : null}
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
          element.style.transform = "translateY(-1px)";
          element.style.borderColor = "#d4d4d4";
        }
      }}
      onMouseLeave={(e) => {
        const element = e.currentTarget.firstChild;
        if (element) {
          element.style.transform = "translateY(0)";
          element.style.borderColor = "#e5e5e5";
        }
      }}
    >
      {card}
    </Link>
  );
}

export function SectionPanel({ title, subtitle, children, style }) {
  return (
    <SurfaceCard style={{ padding: 20, ...style }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "#111111" }}>{title}</h2>
        {subtitle ? <p style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>{subtitle}</p> : null}
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
          element.style.backgroundColor = "#f5f5f5";
          element.style.borderLeftColor = "#111111";
          element.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        const element = e.currentTarget.firstChild;
        if (element) {
          element.style.transform = "translateY(0)";
          element.style.backgroundColor = "#fff";
          element.style.borderLeftColor = "transparent";
        }
      }}
    >
      <SurfaceCard
        style={{
          display: "block",
          minWidth: 200,
          padding: "18px 20px",
          borderLeft: "2px solid transparent",
          transition: "transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: "#111111", margin: "0 0 4px 0" }}>{title}</p>
        <p style={{ fontSize: 12, color: "#6b6b6b", margin: 0 }}>{sub}</p>
      </SurfaceCard>
    </Link>
  );
}
