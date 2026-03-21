import { useEffect, useMemo, useState } from "react";
import { useToast } from "../components/ToastContext.jsx";
import { StatCard, StatusPill, SurfaceCard } from "../components/ui.jsx";
import api from "../api/client";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function StatusBadge({ status }) {
  const tone =
    status === "ACCEPTED"
      ? "success"
      : status === "EXPIRED"
        ? "warning"
        : status === "REVOKED"
          ? "danger"
          : "info";

  const label =
    status === "ACCEPTED"
      ? "Accepted"
      : status === "EXPIRED"
        ? "Expired"
        : status === "REVOKED"
          ? "Revoked"
          : "Pending";

  return <StatusPill label={label} tone={tone} />;
}

function InvitationSkeleton() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1.35fr 150px 110px 120px 120px 170px",
            gap: 12,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
          }}
        >
          {Array.from({ length: 6 }, (_, item) => (
            <div
              key={item}
              style={{
                height: 14,
                borderRadius: 999,
                backgroundColor: item === 0 ? "#e2e8f0" : "#f1f5f9",
                width: `${58 + item * 6}%`,
                alignSelf: "center",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Invitations() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busyInviteId, setBusyInviteId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/invitations");
      setRows(res.data.data.invitations ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const pending = rows.filter((row) => row.status === "PENDING").length;
    const accepted = rows.filter((row) => row.status === "ACCEPTED").length;
    const expired = rows.filter((row) => row.status === "EXPIRED").length;
    return { pending, accepted, expired };
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const resendInvite = async (row) => {
    setBusyInviteId(row.id);
    try {
      await api.post("/invitations", { email: row.email, role: row.role });
      toast.success(`Invitation resent to ${row.email}.`, { title: "Invitation resent" });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to resend invitation.", { title: "Resend failed" });
    } finally {
      setBusyInviteId(null);
    }
  };

  const revokeInvite = async (row) => {
    setBusyInviteId(row.id);
    try {
      await api.post(`/invitations/${row.id}/revoke`);
      toast.success(`Invitation for ${row.email} was revoked.`, { title: "Invitation revoked" });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to revoke invitation.", { title: "Revoke failed" });
    } finally {
      setBusyInviteId(null);
    }
  };

  const filterChips = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "EXPIRED", label: "Expired" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
          border: "1px solid #dbeafe",
          borderRadius: 20,
          padding: "24px 26px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 30, color: "#1e293b" }}>Invitations</h1>
          <p style={{ margin: "0 0 14px 0", color: "#64748b", fontSize: 14, maxWidth: 620 }}>
            Track account invitations across the company, spot stalled invites quickly, and manage pending access from one place.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, backgroundColor: "#fff", border: "1px solid #dbeafe", fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>
              {rows.length} total invite{rows.length === 1 ? "" : "s"}
            </span>
            <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, backgroundColor: "#fff", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", fontWeight: 700 }}>
              {summary.pending} still pending
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Pending" value={summary.pending} sub="Awaiting acceptance" accentColor="#1d4ed8" />
        <StatCard label="Accepted" value={summary.accepted} sub="Accounts activated" accentColor="#16a34a" />
        <StatCard label="Expired" value={summary.expired} sub="Need follow-up or resend" accentColor="#f59e0b" />
      </div>

      <SurfaceCard style={{ padding: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setStatusFilter(chip.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: statusFilter === chip.key ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
              backgroundColor: statusFilter === chip.key ? "#eff6ff" : "#fff",
              color: statusFilter === chip.key ? "#1d4ed8" : "#475569",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {chip.label}
          </button>
        ))}
      </SurfaceCard>

      {error ? <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>{error}</div> : null}

      {loading ? (
        <InvitationSkeleton />
      ) : visibleRows.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", borderRadius: 18, border: "1px dashed #cbd5e1", backgroundColor: "#fff" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#334155", fontSize: 16 }}>No invitations in this view</p>
          <p style={{ margin: "0 auto", fontSize: 13, maxWidth: 420 }}>
            Invitations sent from the Employees page will show up here, along with their acceptance status and linked employee context.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visibleRows.map((row) => (
            <SurfaceCard
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.35fr 150px 110px 120px 120px 170px",
                gap: 12,
                padding: "18px 20px",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 800, color: "#334155" }}>{row.email}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  {row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : `Sent ${formatDate(row.createdAt)}`}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#475569", fontWeight: 700 }}>
                  {row.employee?.department?.name || "Unassigned"}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  {row.employee ? "Linked employee" : "No employee match"}
                </p>
              </div>

              <span style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>{row.role}</span>

              <div>
                <StatusBadge status={row.status} />
              </div>

              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#475569", fontWeight: 700 }}>{formatDate(row.expiresAt)}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>expiry date</p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                {row.status === "PENDING" ? (
                  <>
                    <button
                      onClick={() => resendInvite(row)}
                      disabled={busyInviteId === row.id}
                      style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", cursor: busyInviteId === row.id ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}
                    >
                      {busyInviteId === row.id ? "Working..." : "Resend"}
                    </button>
                    <button
                      onClick={() => revokeInvite(row)}
                      disabled={busyInviteId === row.id}
                      style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #fecaca", backgroundColor: "#fef2f2", cursor: busyInviteId === row.id ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, color: "#b91c1c" }}
                    >
                      Revoke
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>No actions</span>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}
