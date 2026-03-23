import { useEffect, useState } from "react";

export const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: 5,
};

export function Badge({ value }) {
  const styles = {
    active: { backgroundColor: "#dcfce7", color: "#166534" },
    inactive: { backgroundColor: "#f1f5f9", color: "#64748b" },
    suspended: { backgroundColor: "#fef3c7", color: "#92400e" },
  };
  const style = styles[value] || { backgroundColor: "#f1f5f9", color: "#64748b" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "capitalize",
        ...style,
      }}
    >
      {value}
    </span>
  );
}

export function EmployeeAvatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        color: "#1d4ed8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function ActionChip({ children, tone = "neutral", style, ...props }) {
  const tones = {
    neutral: {
      backgroundColor: "#f8fafc",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
    primary: {
      backgroundColor: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    danger: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
  };

  return (
    <button
      {...props}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function InviteBadge({ invitation }) {
  if (!invitation) return null;

  const styles = {
    PENDING: { backgroundColor: "#eff6ff", color: "#1d4ed8", label: "Invite pending" },
    ACCEPTED: { backgroundColor: "#dcfce7", color: "#166534", label: "Invite accepted" },
    EXPIRED: { backgroundColor: "#fef3c7", color: "#92400e", label: "Invite expired" },
  };

  const style = styles[invitation.status] || {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    label: invitation.status,
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        ...style,
      }}
    >
      {style.label}
    </span>
  );
}

export function formatInviteMeta(invitation) {
  if (!invitation) return "";

  if (invitation.status === "PENDING" && invitation.expiresAt) {
    return `Expires ${new Date(invitation.expiresAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  if (invitation.status === "ACCEPTED" && invitation.acceptedAt) {
    return `Accepted ${new Date(invitation.acceptedAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  if (invitation.status === "EXPIRED" && invitation.expiresAt) {
    return `Expired ${new Date(invitation.expiresAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  return "";
}

export function Field({ label, children, hint, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error ? (
        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#b91c1c" }}>{error}</p>
      ) : hint ? (
        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#94a3b8" }}>{hint}</p>
      ) : null}
    </div>
  );
}

export function buildInputStyle(error) {
  return error ? { ...inputStyle, borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : inputStyle;
}

export function EmployeeTableSkeleton({ rows = 3, cols }) {
  return Array.from({ length: rows }, (_, index) => (
    <div
      key={index}
      style={{
        display: "grid",
        gridTemplateColumns: cols.join(" "),
        padding: "18px 24px",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          style={{
            height: 14,
            backgroundColor: "#f1f5f9",
            borderRadius: 999,
            width: `${50 + item * 8}%`,
          }}
        />
      ))}
    </div>
  ));
}

export function SectionSkeleton({ title = "Loading..." }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <p style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "#64748b" }}>{title}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[...Array(6)].map((_, index) => (
          <div key={index} style={{ height: 14, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
        ))}
      </div>
    </div>
  );
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, letterSpacing: "1.4px", textTransform: "uppercase", fontWeight: 700, color: "#94a3b8" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{value || "—"}</span>
    </div>
  );
}

