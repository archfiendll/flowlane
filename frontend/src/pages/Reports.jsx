import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { StatCard, StatusPill, SurfaceCard } from "../components/ui.jsx";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
  { value: "super_admin", label: "Super admin" },
  { value: "unassigned", label: "Unassigned" },
];

const REPORTS = [
  {
    key: "headcount",
    title: "Headcount Report",
    subtitle: "Employee names, departments, positions, status, and start dates.",
    emptyMessage: "No employees match the selected filters.",
  },
  {
    key: "leave",
    title: "Leave / Vacation Report",
    subtitle: "Vacation requests with leave type, dates, status, and day count.",
    emptyMessage: "No leave requests match the selected filters.",
  },
  {
    key: "onboarding",
    title: "Onboarding Status Report",
    subtitle: "Invitations and account activation progress for new hires.",
    emptyMessage: "No onboarding records match the selected filters.",
  },
  {
    key: "contract-expiry",
    title: "Contract Expiry Report",
    subtitle: "Contracts expiring in the next 90 days, with remaining days.",
    emptyMessage: "No contracts are expiring in the selected window.",
  },
];

const filterSelectStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e0e0e0",
  backgroundColor: "#fff",
  color: "#111111",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const dateInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e0e0e0",
  backgroundColor: "#fff",
  color: "#111111",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const exportButtonStyle = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid #e0e0e0",
  backgroundColor: "#fff",
  color: "#111111",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatMoney(value, currency) {
  if (value === null || value === undefined) return "—";
  const amount = formatNumber(value);
  return currency ? `${amount} ${currency}` : amount;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPayrollDisplay(totalsByCurrency) {
  if (!totalsByCurrency?.length) return "—";
  if (totalsByCurrency.length === 1) {
    const total = totalsByCurrency[0];
    return formatMoney(total.totalGrossSalary, total.currency);
  }

  return `${totalsByCurrency.length} currencies`;
}

function getStatusPillTone(type, value) {
  if (type === "role") {
    if (value === "admin") return "info";
    if (value === "manager") return "warning";
    if (value === "employee") return "success";
    return "neutral";
  }

  if (type === "status") {
    if (value === "active" || value === "accepted") return "success";
    if (value === "inactive" || value === "rejected" || value === "expired") return "warning";
    if (value === "pending") return "info";
  }

  return "neutral";
}

function ReportsSkeleton() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <SurfaceCard style={{ minHeight: 180, padding: 24, border: "1px solid #efefef" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {Array.from({ length: 5 }, (_, index) => (
          <SurfaceCard key={index} style={{ minHeight: 120, padding: 20, border: "1px solid #efefef" }} />
        ))}
      </div>
      {Array.from({ length: 4 }, (_, index) => (
        <SurfaceCard key={index} style={{ minHeight: index === 3 ? 320 : 420, padding: 20, border: "1px solid #efefef" }} />
      ))}
    </div>
  );
}

function ReportTable({ columns, rows, emptyMessage, renderRow, minWidth = 980 }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth, borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align || "left",
                  padding: "12px 14px",
                  fontSize: 11,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "#6b6b6b",
                  borderBottom: "1px solid #efefef",
                  whiteSpace: "nowrap",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "28px 16px",
                  color: "#94a3b8",
                  textAlign: "center",
                  fontSize: 13,
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => renderRow(row))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({ title, subtitle, badge, exporting, onExport }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div>
        <p style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 600, color: "#111111" }}>{title}</p>
        <p style={{ margin: 0, fontSize: 13, color: "#6b6b6b", lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {badge ? <StatusPill label={badge} tone="neutral" /> : null}
        <button type="button" onClick={onExport} disabled={exporting} style={exportButtonStyle}>
          {exporting ? "Generating..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}

function parseFilenameFromDisposition(disposition) {
  if (!disposition) return "";

  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || "";
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function Reports() {
  const [filters, setFilters] = useState({
    departmentId: "",
    role: "all",
    from: "",
    to: "",
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingType, setExportingType] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const params = {};
        if (filters.departmentId) params.departmentId = filters.departmentId;
        if (filters.role !== "all") params.role = filters.role;
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;

        const res = await api.get("/reports", { params });
        if (!cancelled) {
          setReport(res.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error?.message || "Failed to load reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReports();
    return () => {
      cancelled = true;
    };
  }, [filters.departmentId, filters.from, filters.role, filters.to]);

  const selectedDepartmentLabel = useMemo(() => {
    if (!report?.departments?.length || !filters.departmentId) return "All departments";
    return report.departments.find((department) => String(department.id) === String(filters.departmentId))?.name || "All departments";
  }, [filters.departmentId, report?.departments]);

  const selectedRoleLabel = useMemo(() => {
    if (filters.role === "all") return "All roles";
    return ROLE_OPTIONS.find((role) => role.value === filters.role)?.label || filters.role;
  }, [filters.role]);

  const data = report?.reports || {};
  const headcountRows = data.headcount || report?.headcountRows || [];
  const leaveRows = data.leave || report?.leaveRows || [];
  const onboardingRows = data.onboarding || report?.onboardingRows || [];
  const contractExpiryRows = data.contractExpiry || report?.contractExpiryRows || [];

  const summaryCards = useMemo(() => {
    const payrollDisplay = getPayrollDisplay(report?.summary?.payrollTotalsByCurrency || []);

    return [
      {
        label: "Headcount",
        value: report?.summary?.headcountCount || 0,
        sub: `${report?.summary?.activeEmployeeCount || 0} active · ${report?.summary?.inactiveEmployeeCount || 0} inactive`,
      },
      {
        label: "Leave requests",
        value: report?.summary?.leaveRequestCount || 0,
        sub: `${report?.summary?.pendingVacationRequests || 0} pending · ${report?.summary?.approvedVacationRequests || 0} approved`,
      },
      {
        label: "Onboarding records",
        value: report?.summary?.onboardingCount || 0,
        sub: `${report?.summary?.acceptedInviteCount || 0} accepted · ${report?.summary?.pendingInviteCount || 0} pending`,
      },
      {
        label: "Contract expiries",
        value: report?.summary?.contractExpiryCount || 0,
        sub: "Expiring in the next 90 days",
      },
      {
        label: "Gross payroll",
        value: payrollDisplay,
        sub: "Stored gross salary only",
      },
    ];
  }, [report]);

  const roleBreakdown = report?.roleBreakdown || [];
  const reportDatePill = useMemo(() => {
    if (filters.from && filters.to) return `${filters.from} to ${filters.to}`;
    if (filters.from) return `From ${filters.from}`;
    if (filters.to) return `Until ${filters.to}`;
    return "All dates";
  }, [filters.from, filters.to]);

  const handleExport = async (reportType) => {
    setExportingType(reportType);
    setError("");

    try {
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.role !== "all") params.role = filters.role;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get(`/reports/export/${reportType}`, {
        params,
        responseType: "blob",
      });

      const fallbackDate = getTodayIsoDate();
      const filename = parseFilenameFromDisposition(res.headers?.["content-disposition"])
        || `${reportType.replace(/-/g, "_")}_report_${fallbackDate}.csv`;

      downloadBlob(res.data, filename);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to export CSV.");
    } finally {
      setExportingType("");
    }
  };

  if (loading && !report) {
    return <ReportsSkeleton />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section
        style={{
          background: "#fff",
          border: "1px solid #efefef",
          borderRadius: 18,
          padding: "24px 26px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 400, color: "#6b6b6b" }}>
            Admin analytics workspace
          </p>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 600, color: "#111111" }}>Reports</h1>
          <p style={{ margin: 0, color: "#6b6b6b", fontSize: 14, maxWidth: 820, lineHeight: 1.6 }}>
            Review headcount, leave, onboarding, and contract expiry data from one place. Filters apply across all reports, and the contract expiry export is limited to the next 90 days.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatusPill label={selectedDepartmentLabel} tone="neutral" />
          <StatusPill label={selectedRoleLabel} tone="neutral" />
          <StatusPill label={reportDatePill} tone="neutral" />
        </div>
      </section>

      {error ? (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {summaryCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} sub={card.sub} />
        ))}
      </div>

      <SurfaceCard style={{ padding: 18, display: "grid", gap: 16 }}>
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "#111111" }}>Filters</p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>
            Narrow the reports by department, role, and date range.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 400, color: "#6b6b6b" }}>Department</span>
            <select
              value={filters.departmentId}
              onChange={(event) => setFilters((current) => ({ ...current, departmentId: event.target.value }))}
              style={filterSelectStyle}
            >
              <option value="">All departments</option>
              {(report?.departments || []).map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 400, color: "#6b6b6b" }}>Role</span>
            <select
              value={filters.role}
              onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
              style={filterSelectStyle}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 400, color: "#6b6b6b" }}>From</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
              style={dateInputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 400, color: "#6b6b6b" }}>To</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
              style={dateInputStyle}
            />
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setFilters({ departmentId: "", role: "all", from: "", to: "" })}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                backgroundColor: "#fff",
                color: "#111111",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Reset filters
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
        <SectionHeader
          title="Headcount Report"
          subtitle="Employee names, departments, positions, status, and start dates."
          badge={`${headcountRows.length} rows`}
          exporting={exportingType === "headcount"}
          onExport={() => handleExport("headcount")}
        />

        <ReportTable
          minWidth={920}
          columns={[
            { key: "employeeName", label: "Employee" },
            { key: "department", label: "Department" },
            { key: "position", label: "Position" },
            { key: "status", label: "Status" },
            { key: "startDate", label: "Start date" },
          ]}
          rows={headcountRows}
          emptyMessage={REPORTS[0].emptyMessage}
          renderRow={(row) => (
            <tr key={row.id}>
              <td style={tdStyle}>
                <div>
                  <p style={nameStyle}>{row.employeeName}</p>
                  <p style={subtleStyle}>{row.roleLabel}</p>
                </div>
              </td>
              <td style={tdStyle}>{row.department}</td>
              <td style={tdStyle}>{row.position}</td>
              <td style={tdStyle}>
                <StatusPill label={row.status} tone={getStatusPillTone("status", row.status)} />
              </td>
              <td style={tdStyle}>{row.startDate}</td>
            </tr>
          )}
        />
      </SurfaceCard>

      <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
        <SectionHeader
          title="Leave / Vacation Report"
          subtitle="Vacation requests with leave type, dates, status, and day count."
          badge={`${leaveRows.length} rows`}
          exporting={exportingType === "leave"}
          onExport={() => handleExport("leave")}
        />

        <ReportTable
          minWidth={1080}
          columns={[
            { key: "employeeName", label: "Employee" },
            { key: "department", label: "Department" },
            { key: "leaveType", label: "Leave type" },
            { key: "startDate", label: "Start date" },
            { key: "endDate", label: "End date" },
            { key: "status", label: "Status" },
            { key: "daysCount", label: "Days count", align: "right" },
          ]}
          rows={leaveRows}
          emptyMessage={REPORTS[1].emptyMessage}
          renderRow={(row) => (
            <tr key={row.id}>
              <td style={tdStyle}>
                <div>
                  <p style={nameStyle}>{row.employeeName}</p>
                  <p style={subtleStyle}>{row.roleLabel}</p>
                </div>
              </td>
              <td style={tdStyle}>{row.department}</td>
              <td style={tdStyle}>{row.leaveType}</td>
              <td style={tdStyle}>{row.startDate}</td>
              <td style={tdStyle}>{row.endDate}</td>
              <td style={tdStyle}>
                <StatusPill label={row.status} tone={getStatusPillTone("status", row.status)} />
              </td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{row.daysCount}</td>
            </tr>
          )}
        />
      </SurfaceCard>

      <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
        <SectionHeader
          title="Onboarding Status Report"
          subtitle="Invitation and account activation progress for new hires."
          badge={`${onboardingRows.length} rows`}
          exporting={exportingType === "onboarding"}
          onExport={() => handleExport("onboarding")}
        />

        <ReportTable
          minWidth={980}
          columns={[
            { key: "employeeName", label: "Employee" },
            { key: "position", label: "Position" },
            { key: "inviteDate", label: "Invite date" },
            { key: "inviteStatus", label: "Invite status" },
            { key: "departments", label: "Departments" },
          ]}
          rows={onboardingRows}
          emptyMessage={REPORTS[2].emptyMessage}
          renderRow={(row) => (
            <tr key={row.id}>
              <td style={tdStyle}>
                <div>
                  <p style={nameStyle}>{row.employeeName}</p>
                  <p style={subtleStyle}>{row.roleLabel}</p>
                </div>
              </td>
              <td style={tdStyle}>{row.position}</td>
              <td style={tdStyle}>{row.inviteDate}</td>
              <td style={tdStyle}>
                <StatusPill label={row.inviteStatus} tone={getStatusPillTone("status", row.inviteStatus)} />
              </td>
              <td style={tdStyle}>{row.departments}</td>
            </tr>
          )}
        />
      </SurfaceCard>

      <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
        <SectionHeader
          title="Contract Expiry Report"
          subtitle="Contracts expiring in the next 90 days, with days until expiry."
          badge={`${contractExpiryRows.length} rows`}
          exporting={exportingType === "contract-expiry"}
          onExport={() => handleExport("contract-expiry")}
        />

        <ReportTable
          minWidth={980}
          columns={[
            { key: "employeeName", label: "Employee" },
            { key: "department", label: "Department" },
            { key: "contractStart", label: "Contract start" },
            { key: "contractEnd", label: "Contract end" },
            { key: "daysUntilExpiry", label: "Days until expiry", align: "right" },
          ]}
          rows={contractExpiryRows}
          emptyMessage={REPORTS[3].emptyMessage}
          renderRow={(row) => (
            <tr key={row.id}>
              <td style={tdStyle}>
                <div>
                  <p style={nameStyle}>{row.employeeName}</p>
                  <p style={subtleStyle}>{row.roleLabel}</p>
                </div>
              </td>
              <td style={tdStyle}>{row.department}</td>
              <td style={tdStyle}>{row.contractStart}</td>
              <td style={tdStyle}>{row.contractEnd}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{row.daysUntilExpiry}</td>
            </tr>
          )}
        />
      </SurfaceCard>

      <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 600, color: "#111111" }}>
              Payroll overview
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>
              Gross salary totals based on the current filter set. This does not subtract taxes or deductions.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(report?.summary?.payrollTotalsByCurrency || []).map((item) => (
              <StatusPill key={item.currency} label={`${item.currency}: ${formatNumber(item.totalGrossSalary)}`} tone="neutral" />
            ))}
          </div>
        </div>

        <ReportTable
          minWidth={920}
          columns={[
            { key: "employee", label: "Employee" },
            { key: "department", label: "Department" },
            { key: "role", label: "Role" },
            { key: "jobTitle", label: "Job title" },
            { key: "salary", label: "Gross salary", align: "right" },
          ]}
          rows={headcountRows}
          emptyMessage="No employees match the selected filters."
          renderRow={(row) => (
            <tr key={`payroll-${row.id}`}>
              <td style={tdStyle}>
                <div>
                  <p style={nameStyle}>{row.employeeName}</p>
                  <p style={subtleStyle}>{formatDate(row.contractStart)}</p>
                </div>
              </td>
              <td style={tdStyle}>{row.department}</td>
              <td style={tdStyle}>
                <StatusPill label={row.roleLabel} tone={getStatusPillTone("role", row.role)} />
              </td>
              <td style={tdStyle}>{row.position}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                {formatMoney(row.grossSalary, row.currency)}
              </td>
            </tr>
          )}
        />
      </SurfaceCard>

      <SurfaceCard style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 600, color: "#111111" }}>
              Workforce breakdown
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#6b6b6b" }}>
              Active employees grouped by role in the current filter set.
            </p>
          </div>
          <StatusPill label={`${roleBreakdown.length} role groups`} tone="neutral" />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {roleBreakdown.map((item) => (
            <StatusPill key={item.role} label={`${item.label}: ${item.count}`} tone={getStatusPillTone("role", item.role)} />
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #f0f0f0",
  verticalAlign: "middle",
  color: "#111111",
  fontSize: 13,
};

const nameStyle = {
  margin: "0 0 4px 0",
  fontSize: 14,
  fontWeight: 600,
  color: "#111111",
};

const subtleStyle = {
  margin: 0,
  fontSize: 12,
  color: "#6b6b6b",
};
