import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

function StatCard({ label, value, sub, accentColor }) {
  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderTop: `3px solid ${accentColor}`,
      borderRadius: 12,
      padding: "20px 24px",
      minWidth: 180,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        letterSpacing: "1.5px", textTransform: "uppercase",
        marginBottom: 8, margin: "0 0 8px 0",
      }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/auth/me");
        if (!cancelled) setMe(res.data.user);
      } catch {
        if (!cancelled) setError("Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading...</p>;
  if (error) return (
    <div style={{
      padding: "10px 14px", backgroundColor: "#fef2f2",
      border: "1px solid #fecaca", borderRadius: 8,
      color: "#b91c1c", fontSize: 13,
    }}>{error}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Welcome back,{" "}
          <span style={{ color: "#475569", fontWeight: 600 }}>{me?.email}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="System Status" value="Online" sub="All services operational" accentColor="#10b981" />
        <StatCard
          label="Signed in as"
          value={me?.role?.charAt(0).toUpperCase() + me?.role?.slice(1)}
          sub={me?.email}
          accentColor="#1d6fc4"
        />
        <StatCard label="Platform" value="Flowlane" sub="HR Operations" accentColor="#003580" />
      </div>

      {/* Quick access */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#94a3b8",
          letterSpacing: "2px", textTransform: "uppercase",
          marginBottom: 12, margin: "0 0 12px 0",
        }}>Quick Access</p>
        <Link
          to="/employees"
          style={{
            display: "inline-block", padding: "16px 20px",
            backgroundColor: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 12, textDecoration: "none", minWidth: 180,
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#1d6fc4";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(29,111,196,0.12)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Employees →
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>View and manage staff</p>
        </Link>
      </div>

      {/* System info table */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#94a3b8",
          letterSpacing: "2px", textTransform: "uppercase",
          margin: "0 0 12px 0",
        }}>System Information</p>
        <div style={{
          backgroundColor: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 12, overflow: "hidden", maxWidth: 560,
        }}>
          {[
            { label: "Authentication", value: "JWT · Stateless" },
            { label: "Access Control", value: "Role-Based (RBAC)" },
            { label: "Current Role", value: me?.role?.toUpperCase() },
            { label: "Backend", value: "Express · PostgreSQL · Prisma" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex", alignItems: "center",
              padding: "12px 20px",
              borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
              <span style={{
                width: 180, fontSize: 11, fontWeight: 700,
                color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase",
              }}>{row.label}</span>
              <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}