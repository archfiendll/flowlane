import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { QuickLinkCard, SectionPanel, StatCard, StatusPill } from "../components/ui.jsx";
import api from "../api/client";
import { ActivityRow, ChecklistItem, DashboardSkeleton, formatDashboardDate } from "../features/dashboard/ui.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const role = user?.role;
  const isAdminOrManager = role === "admin" || role === "manager";

  const loadDashboard = useCallback(async (cancelledRef) => {
    setLoading(true);
    setError("");
    try {
      const requests = [api.get("/dashboard/stats")];

      if (isAdminOrManager) {
        requests.push(api.get("/company/me"));
        requests.push(api.get("/invitations"));
      }

      const [statsRes, companyRes, invitesRes] = await Promise.all(requests);

      if (cancelledRef?.current) return;

      setStats(statsRes.data.data);
      setCompany(companyRes?.data?.data?.company ?? null);
      setInvites(invitesRes?.data?.data?.invitations ?? []);
    } catch {
      if (!cancelledRef?.current) setError("Failed to load dashboard.");
    } finally {
      if (!cancelledRef?.current) setLoading(false);
    }
  }, [isAdminOrManager]);

  useEffect(() => {
    const cancelledRef = { current: false };
    loadDashboard(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [loadDashboard]);

  const companyChecklist = useMemo(() => {
    if (!company) return [];
    return [
      {
        done: Boolean(company.name && company.legalAddress && company.city && company.country),
        label: "Core company profile",
        hint: "Legal address, country, city, and company name are in place.",
        to: "/company-setup",
      },
      {
        done: Boolean(company.legalRepName && company.legalRepTitle),
        label: "Legal representative",
        hint: "Representative details are ready for contracts and onboarding.",
        to: "/company-setup",
      },
      {
        done: Boolean(company.profileRO?.cui && company.profileRO?.tradeRegister && company.profileRO?.caenCode),
        label: "Romanian company profile",
        hint: "Local fiscal and registry fields are filled in.",
        to: "/company-setup",
      },
    ];
  }, [company]);

  const inviteSummary = useMemo(() => {
    const pending = invites.filter((invite) => invite.status === "PENDING").length;
    const accepted = invites.filter((invite) => invite.status === "ACCEPTED").length;
    const expired = invites.filter((invite) => invite.status === "EXPIRED").length;
    return { pending, accepted, expired };
  }, [invites]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div
        style={{
          padding: "18px 20px",
          backgroundColor: "#fff7ed",
          border: "1px solid #fdba74",
          borderRadius: 12,
          color: "#9a3412",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700 }}>Unable to load dashboard</p>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
        <button
          type="button"
          onClick={() => loadDashboard()}
          style={{
            padding: "8px 14px",
            backgroundColor: "#fff",
            border: "1px solid #fdba74",
            borderRadius: 8,
            color: "#9a3412",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const employeeDaysLeft = stats?.employee
    ? (stats.employee.vacationDaysPerYear + stats.employee.vacationCarryOver) - stats.employee.vacationDaysUsed
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section
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
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: 11,
              fontWeight: 700,
              color: "#1d4ed8",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            {role === "employee" ? "Personal workspace" : "Operations overview"}
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1e293b", margin: "0 0 6px 0" }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, maxWidth: 640 }}>
            {isAdminOrManager
              ? `Welcome back, ${user?.email}. Here's the current state of people operations, setup progress, and invite activity across the company.`
              : `Welcome back, ${user?.email}. Here's your quick view of time off, contract context, and the actions you probably need today.`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isAdminOrManager ? (
            <>
              <StatusPill label={`${stats.totalEmployees} active employees`} tone="info" style={{ backgroundColor: "#fff" }} />
              <StatusPill label={`${stats.pendingVacations} pending vacation requests`} tone="warning" style={{ backgroundColor: "#fff" }} />
            </>
          ) : stats.employee ? (
            <>
              <StatusPill label={`${employeeDaysLeft} vacation days left`} tone="success" style={{ backgroundColor: "#fff" }} />
              <StatusPill label={`Since ${formatDashboardDate(stats.employee.startDate)}`} tone="neutral" style={{ backgroundColor: "#fff" }} />
            </>
          ) : null}
        </div>
      </section>

      {isAdminOrManager ? (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <StatCard label="Active Employees" value={stats.totalEmployees} sub="People currently active in the company" accentColor="#1d6fc4" to="/employees" />
            <StatCard label="Departments" value={stats.totalDepartments} sub="Teams set up across the company" accentColor="#003580" to="/departments" />
            <StatCard label="Pending Vacations" value={stats.pendingVacations} sub="Requests waiting for a decision" accentColor={stats.pendingVacations > 0 ? "#f59e0b" : "#10b981"} to="/vacations" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
            <SectionPanel title="Quick Access" subtitle="Jump into the workflows you’re most likely to use next.">
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <QuickLinkCard to="/employees" title="Employees" sub="Review records, archive staff, and manage details" />
                <QuickLinkCard to="/departments" title="Departments" sub="Structure teams and jump into filtered employees" />
                <QuickLinkCard to="/vacations" title="Vacations" sub="Approve or reject time off requests" />
                <QuickLinkCard to="/invitations" title="Invitations" sub="Track pending access and resend stalled invites" />
              </div>
            </SectionPanel>

            <SectionPanel title="Invite Activity" subtitle="A quick pulse on access setup across the company.">
              <div style={{ display: "grid", gap: 10 }}>
                <ActivityRow label="Pending invitations" value={`${inviteSummary.pending} awaiting acceptance`} tone={inviteSummary.pending > 0 ? "warning" : "success"} />
                <ActivityRow label="Accepted invitations" value={`${inviteSummary.accepted} completed`} tone="success" />
                <ActivityRow label="Expired invitations" value={`${inviteSummary.expired} need attention`} tone={inviteSummary.expired > 0 ? "warning" : "neutral"} />
              </div>
            </SectionPanel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <SectionPanel title="Setup Checklist" subtitle="A fast read on whether the company profile is complete enough for HR workflows.">
              <div style={{ display: "grid", gap: 10 }}>
                {companyChecklist.map((item) => (
                  <ChecklistItem key={item.label} done={item.done} label={item.label} hint={item.hint} to={item.to} />
                ))}
              </div>
            </SectionPanel>

            <SectionPanel title="Operational Notes" subtitle="Simple reminders based on the current company state.">
              <div style={{ display: "grid", gap: 10 }}>
                <ActivityRow label="Company setup" value={companyChecklist.every((item) => item.done) ? "Complete enough for current flows" : "Still missing a few fields"} tone={companyChecklist.every((item) => item.done) ? "success" : "info"} />
                <ActivityRow label="Departments coverage" value={stats.totalDepartments > 0 ? `${stats.totalDepartments} teams available` : "No departments yet"} tone={stats.totalDepartments > 0 ? "success" : "warning"} />
                <ActivityRow label="Vacation approvals" value={stats.pendingVacations > 0 ? `${stats.pendingVacations} requests need action` : "No pending approvals"} tone={stats.pendingVacations > 0 ? "warning" : "success"} />
              </div>
            </SectionPanel>
          </div>
        </>
      ) : (
        <>
          {stats.employee ? (
            <>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <StatCard label="Vacation Days Left" value={employeeDaysLeft} sub={`${stats.employee.vacationDaysUsed} used · ${stats.employee.vacationCarryOver} carried over`} accentColor="#10b981" to="/vacations" />
                <StatCard label="Job Title" value={stats.employee.jobTitle} sub={stats.employee.department?.name ?? "No department"} accentColor="#1d6fc4" />
                <StatCard label="Contract" value={stats.employee.contractType === "PERMANENT" ? "Permanent" : "Fixed Term"} sub={`Since ${formatDashboardDate(stats.employee.startDate)}`} accentColor="#003580" />
                <StatCard label="Pending Requests" value={stats.pendingVacations} sub="Vacation requests awaiting review" accentColor={stats.pendingVacations > 0 ? "#f59e0b" : "#10b981"} to="/vacations" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
                <SectionPanel title="Your Profile Snapshot" subtitle="A quick reminder of the employment details currently on file.">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <ActivityRow label="Department" value={stats.employee.department?.name || "Not assigned"} tone="info" />
                    <ActivityRow label="Gross Salary" value={stats.employee.grossSalary ? `${stats.employee.grossSalary} ${stats.employee.currency}` : "Not available"} tone="neutral" />
                    <ActivityRow label="Contract start" value={formatDashboardDate(stats.employee.startDate)} tone="neutral" />
                    <ActivityRow label="Contract type" value={stats.employee.contractType === "PERMANENT" ? "Permanent" : "Fixed term"} tone="neutral" />
                  </div>
                </SectionPanel>

                <SectionPanel title="Quick Access" subtitle="The actions you’re most likely to need from here.">
                  <div style={{ display: "grid", gap: 12 }}>
                    <QuickLinkCard to="/vacations" title="Request Vacation" sub="Submit time off and follow the review status" />
                  </div>
                </SectionPanel>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: "20px 24px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 14,
                fontSize: 13,
                color: "#92400e",
              }}
            >
              Your employee profile hasn&apos;t been set up yet. Contact your admin so your contract and vacation information can appear here.
            </div>
          )}
        </>
      )}
    </div>
  );
}
