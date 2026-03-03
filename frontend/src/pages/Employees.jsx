import { useEffect, useState } from "react";
import api from "../api/client";

function Badge({ value }) {
  const styles = {
    admin: { backgroundColor: "#fef3c7", color: "#92400e" },
    employee: { backgroundColor: "#eff6ff", color: "#1d4ed8" },
  };
  const s = styles[value] || { backgroundColor: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px",
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      textTransform: "capitalize", ...s,
    }}>{value}</span>
  );
}

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/users");
        if (!cancelled) setRows(res.data.data ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const cols = ["60px", "1fr", "120px", "140px"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
          Employees
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          {loading ? "Loading..." : `${rows.length} record${rows.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", backgroundColor: "#fef2f2",
          border: "1px solid #fecaca", borderRadius: 8,
          color: "#b91c1c", fontSize: 13,
        }}>{error}</div>
      )}

      {/* Table */}
      <div style={{
        backgroundColor: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 12, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: cols.join(" "),
          padding: "10px 20px",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          {["ID", "Email", "Role", "Created"].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>{h}</span>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && [1, 2, 3].map(i => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: cols.join(" "),
            padding: "14px 20px",
            borderBottom: "1px solid #f1f5f9",
          }}>
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{
                height: 14, backgroundColor: "#f1f5f9",
                borderRadius: 4, width: `${50 + j * 10}%`,
              }} />
            ))}
          </div>
        ))}

        {/* Empty */}
        {!loading && rows.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
            <p style={{ fontSize: 14, margin: 0 }}>No employees found</p>
          </div>
        )}

        {/* Rows */}
        {!loading && rows.map((u, i) => (
          <div
            key={u.id}
            onMouseEnter={() => setHoveredRow(u.id)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: "grid", gridTemplateColumns: cols.join(" "),
              padding: "13px 20px", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: hoveredRow === u.id ? "#f8fafc" : "#fff",
              transition: "background-color 0.1s",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
              #{u.id}
            </span>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{u.email}</span>
            <span><Badge value={u.role} /></span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {u.createdAt ? formatDate(u.createdAt) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}