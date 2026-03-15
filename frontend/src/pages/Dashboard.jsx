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
        margin: "0 0 8px 0",
      }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{sub}</p>}
    </div>
  );
}

function QuickLink({ to, title, sub }) {
  return (
    <Link
      to={to}
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
        {title} →
      </p>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{sub}</p>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role = user?.role;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard/stats");
        if (!cancelled) setStats(res.data.data);
      } catch {
        if (!cancelled) setError("Failed to load dashboard.");
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

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Welcome back,{" "}
          <span style={{ color: "#475569", fontWeight: 600 }}>{user?.email}</span>
        </p>
      </div>

      {/* Admin / Manager view */}
      {(role === "admin" || role === "manager") && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <StatCard
              label="Active Employees"
              value={stats.totalEmployees}
              sub="In your company"
              accentColor="#1d6fc4"
            />
            <StatCard
              label="Departments"
              value={stats.totalDepartments}
              sub="Across the company"
              accentColor="#003580"
            />
            <StatCard
              label="Pending Vacations"
              value={stats.pendingVacations}
              sub="Awaiting approval"
              accentColor={stats.pendingVacations > 0 ? "#f59e0b" : "#10b981"}
            />
          </div>

          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              letterSpacing: "2px", textTransform: "uppercase",
              margin: "0 0 12px 0",
            }}>Quick Access</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <QuickLink to="/employees" title="Employees" sub="View and manage staff" />
              <QuickLink to="/departments" title="Departments" sub="Manage departments" />
              <QuickLink to="/vacations" title="Vacations" sub="Review requests" />
            </div>
          </div>
        </>
      )}

      {/* Employee view */}
      {role === "employee" && (
        <>
          {stats.employee ? (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <StatCard
                label="Vacation Days Left"
                value={
                  (stats.employee.vacationDaysPerYear + stats.employee.vacationCarryOver)
                  - stats.employee.vacationDaysUsed
                }
                sub={`${stats.employee.vacationDaysUsed} used · ${stats.employee.vacationCarryOver} carried over`}
                accentColor="#10b981"
              />
              <StatCard
                label="Job Title"
                value={stats.employee.jobTitle}
                sub={stats.employee.department?.name ?? "No department"}
                accentColor="#1d6fc4"
              />
              <StatCard
                label="Contract"
                value={stats.employee.contractType === "PERMANENT" ? "Permanent" : "Fixed Term"}
                sub={`Since ${formatDate(stats.employee.startDate)}`}
                accentColor="#003580"
              />
              <StatCard
                label="Pending Requests"
                value={stats.pendingVacations}
                sub="Vacation requests"
                accentColor={stats.pendingVacations > 0 ? "#f59e0b" : "#10b981"}
              />
            </div>
          ) : (
            <div style={{
              padding: "20px 24px", backgroundColor: "#fffbeb",
              border: "1px solid #fde68a", borderRadius: 12,
              fontSize: 13, color: "#92400e",
            }}>
              Your employee profile hasn't been set up yet. Contact your admin.
            </div>
          )}

          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              letterSpacing: "2px", textTransform: "uppercase",
              margin: "0 0 12px 0",
            }}>Quick Access</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <QuickLink to="/vacations" title="Vacations" sub="Request time off" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}