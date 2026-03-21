import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/ToastContext.jsx";
import { StatCard, StatusPill, SurfaceCard } from "../components/ui.jsx";
import api from "../api/client";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  fontSize: 14,
  backgroundColor: "#f8fafc",
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
};

function StatusBadge({ status }) {
  const tone =
    status === "APPROVED"
      ? "success"
      : status === "REJECTED"
        ? "danger"
        : "warning";
  const label =
    status === "APPROVED"
      ? "Approved"
      : status === "REJECTED"
        ? "Rejected"
        : status === "PENDING_EMPLOYEE_CONFIRMATION"
          ? "Waiting employee"
          : "Waiting admin";
  return <StatusPill label={label} tone={tone} />;
}

function TypeBadge({ type }) {
  const labels = {
    ANNUAL: "Annual",
    MEDICAL: "Medical",
    PARENTAL: "Parental",
    UNPAID: "Unpaid",
  };

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
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
      }}
    >
      {labels[type] || type}
    </span>
  );
}

function VacationTableSkeleton({ canReview }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: canReview ? "1.35fr 130px 170px 120px 170px" : "130px 170px 120px 160px",
            gap: 12,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
          }}
        >
          {Array.from({ length: canReview ? 5 : 4 }, (_, item) => (
            <div
              key={item}
              style={{
                height: 14,
                borderRadius: 999,
                backgroundColor: item === 0 ? "#e2e8f0" : "#f1f5f9",
                width: `${62 + item * 5}%`,
                alignSelf: "center",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function VacationRequestModal({ canReview, employees, onClose, onSaved }) {
  const [form, setForm] = useState({ employeeId: "", type: "ANNUAL", startDate: "", endDate: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fieldErrors = {
    employeeId: canReview && !form.employeeId ? "Employee is required." : "",
    startDate: !form.startDate ? "Start date is required." : "",
    endDate: !form.endDate ? "End date is required." : "",
  };

  if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
    fieldErrors.endDate = "End date must be on or after the start date.";
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (fieldErrors.employeeId || fieldErrors.startDate || fieldErrors.endDate) {
      setError(fieldErrors.employeeId || fieldErrors.startDate || fieldErrors.endDate);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/vacations", {
        ...form,
        employeeId: canReview ? parseInt(form.employeeId, 10) : undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to submit vacation request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.36)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 26,
          boxShadow: "0 28px 80px rgba(15,23,42,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: 22, color: "#1e293b" }}>Request Vacation</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {canReview
              ? "Create a vacation request for an employee after the paperwork is signed and ready to record."
              : "Submit time off with a clear date range so your manager can review it quickly."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {canReview ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Employee
              </label>
              <select
                style={fieldErrors.employeeId ? { ...inputStyle, borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : inputStyle}
                value={form.employeeId}
                onChange={(e) => setForm((current) => ({ ...current, employeeId: e.target.value }))}
              >
                <option value="">Choose employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} · {employee.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Leave Type
            </label>
            <select style={inputStyle} value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}>
              <option value="ANNUAL">Annual</option>
              <option value="MEDICAL">Medical</option>
              <option value="PARENTAL">Parental</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Duration
            </label>
            <div style={{ ...inputStyle, display: "flex", alignItems: "center", color: "#64748b" }}>
              {form.startDate && form.endDate ? `${Math.floor((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1} day(s)` : "Choose dates"}
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Start Date
            </label>
            <input type="date" style={fieldErrors.startDate ? { ...inputStyle, borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : inputStyle} value={form.startDate} onChange={(e) => setForm((current) => ({ ...current, startDate: e.target.value }))} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              End Date
            </label>
            <input type="date" style={fieldErrors.endDate ? { ...inputStyle, borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : inputStyle} value={form.endDate} onChange={(e) => setForm((current) => ({ ...current, endDate: e.target.value }))} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Note
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            value={form.note}
            onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
            placeholder="Optional context for the reviewer"
          />
        </div>

        {error ? <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>{error}</p> : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button type="button" onClick={onClose} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontWeight: 700, color: "#475569" }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{ padding: "10px 16px", borderRadius: 10, border: "none", backgroundColor: "#1d6fc4", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
            {saving ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Vacations() {
  const { user } = useAuth();
  const toast = useToast();
  const canReview = user?.role === "admin" || user?.role === "manager";
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/vacations", {
        params: canReview && departmentFilter ? { departmentId: departmentFilter } : undefined,
      });
      setRequests(res.data.data.requests ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load vacation requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [departmentFilter]);

  useEffect(() => {
    if (!canReview) return undefined;

    let cancelled = false;
    async function loadReferenceData() {
      try {
        const [departmentsRes, employeesRes] = await Promise.all([
          api.get("/departments"),
          api.get("/employees", { params: { archived: "active", limit: 200, sortBy: "name", sortOrder: "asc" } }),
        ]);

        if (!cancelled) {
          setDepartments(departmentsRes.data.data.departments ?? []);
          setEmployees(employeesRes.data.data.data ?? []);
        }
      } catch (_err) {
        if (!cancelled) {
          setDepartments([]);
          setEmployees([]);
        }
      }
    }

    loadReferenceData();
    return () => {
      cancelled = true;
    };
  }, [canReview]);

  const summary = useMemo(() => {
    const pending = requests.filter((request) =>
      canReview
        ? request.status === "PENDING_ADMIN_APPROVAL"
        : request.status === "PENDING_ADMIN_APPROVAL" || request.status === "PENDING_EMPLOYEE_CONFIRMATION"
    ).length;
    const approved = requests.filter((request) => request.status === "APPROVED").length;
    const rejected = requests.filter((request) => request.status === "REJECTED").length;
    return { pending, approved, rejected };
  }, [canReview, requests]);

  const updateStatus = async (requestId, action) => {
    try {
      await api.post(`/vacations/${requestId}/${action}`);
      toast.success(`Request ${action === "approve" ? "approved" : "rejected"}.`, {
        title: action === "approve" ? "Vacation approved" : "Vacation rejected",
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to update request.", { title: "Update failed" });
    }
  };

  const confirmRequest = async (requestId) => {
    try {
      await api.post(`/vacations/${requestId}/confirm`);
      toast.success("Vacation request confirmed.", { title: "Vacation confirmed" });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to confirm request.", { title: "Confirmation failed" });
    }
  };

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
          <h1 style={{ margin: "0 0 8px 0", fontSize: 30, color: "#1e293b" }}>Vacation Requests</h1>
          <p style={{ margin: "0 0 14px 0", color: "#64748b", fontSize: 14, maxWidth: 620 }}>
            {canReview
              ? "Review time off across the company, track what still needs a decision, and focus by department when needed."
              : "Request time off, keep an eye on approvals, and track each request from one place."}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, backgroundColor: "#fff", border: "1px solid #dbeafe", fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>
              {requests.length} total request{requests.length === 1 ? "" : "s"}
            </span>
            <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, backgroundColor: "#fff", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", fontWeight: 700 }}>
              {summary.pending} {canReview ? "pending review" : "still pending"}
            </span>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} style={{ padding: "12px 18px", borderRadius: 12, border: "none", backgroundColor: "#1d6fc4", color: "#fff", cursor: "pointer", fontWeight: 700, boxShadow: "0 12px 30px rgba(29,111,196,0.2)" }}>
          + Request Vacation
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Pending" value={summary.pending} sub={canReview ? "Awaiting your decision" : "Not fully signed yet"} accentColor="#f59e0b" />
        <StatCard label="Approved" value={summary.approved} sub="Approved requests" accentColor="#16a34a" />
        <StatCard label="Rejected" value={summary.rejected} sub="Requests declined" accentColor="#dc2626" />
      </div>

      {canReview ? (
        <SurfaceCard style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase" }}>Department filter</span>
          <div style={{ width: 280 }}>
            <select style={inputStyle} value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
        </SurfaceCard>
      ) : null}

      {error ? <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>{error}</div> : null}

      {loading ? (
        <VacationTableSkeleton canReview={canReview} />
      ) : requests.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", borderRadius: 18, border: "1px dashed #cbd5e1", backgroundColor: "#fff" }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#334155", fontSize: 16 }}>No vacation requests yet</p>
          <p style={{ margin: "0 auto", fontSize: 13, maxWidth: 420 }}>
            {canReview ? "Requests will appear here once employees start submitting time off." : "Your submitted requests will appear here once you ask for time off."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {requests.map((request) => (
            <SurfaceCard
              key={request.id}
              style={{
                display: "grid",
                gridTemplateColumns: canReview ? "1.35fr 130px 170px 120px 170px" : "130px 170px 120px 160px",
                gap: 12,
                padding: "18px 20px",
                alignItems: "center",
              }}
            >
              {canReview ? (
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 800, color: "#334155" }}>
                    {request.employee.firstName} {request.employee.lastName}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    {request.employee.department?.name || "No department"}
                  </p>
                </div>
              ) : null}

              <div>
                <TypeBadge type={request.type} />
              </div>

              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  {Math.floor((new Date(request.endDate) - new Date(request.startDate)) / 86400000) + 1} day(s)
                </p>
              </div>

              <div>
                <StatusBadge status={request.status} />
              </div>

              {canReview ? (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                  {request.status === "PENDING_ADMIN_APPROVAL" ? (
                    <>
                      <button onClick={() => updateStatus(request.id, "approve")} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#166534" }}>Approve</button>
                      <button onClick={() => updateStatus(request.id, "reject")} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #fecaca", backgroundColor: "#fef2f2", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>Reject</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                      {request.status === "PENDING_EMPLOYEE_CONFIRMATION" ? "Waiting for employee" : "Handled"}
                    </span>
                  )}
                </div>
              ) : (
                request.status === "PENDING_EMPLOYEE_CONFIRMATION" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => confirmRequest(request.id)} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                      Confirm
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#475569", fontWeight: 700 }}>
                      {request.status === "PENDING_ADMIN_APPROVAL" ? "Waiting for admin" : "Submitted"}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{formatDate(request.createdAt)}</p>
                  </div>
                )
              )}
            </SurfaceCard>
          ))}
        </div>
      )}

      {showModal ? <VacationRequestModal canReview={canReview} employees={employees} onClose={() => setShowModal(false)} onSaved={load} /> : null}
    </div>
  );
}
