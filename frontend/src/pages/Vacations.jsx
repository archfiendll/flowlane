import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useToast } from "../components/ToastContext.jsx";
import { StatCard, SurfaceCard } from "../components/ui.jsx";
import api from "../api/client";
import { VacationRequestModal } from "../features/vacations/VacationRequestModal.jsx";
import { StatusBadge, TypeBadge, VacationSelect, VacationTableSkeleton, calculateVacationDays, formatVacationDate } from "../features/vacations/ui.jsx";
import { isPendingAdminApproval, isPendingEmployeeConfirmation } from "../features/vacations/workflow.js";

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

  const load = useCallback(async () => {
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
  }, [canReview, departmentFilter]);

  useEffect(() => {
    void load();
  }, [load]);

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
      } catch {
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
        ? isPendingAdminApproval(request.status)
        : isPendingAdminApproval(request.status) || isPendingEmployeeConfirmation(request.status)
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
            <VacationSelect value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </VacationSelect>
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
                  {formatVacationDate(request.startDate)} - {formatVacationDate(request.endDate)}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  {calculateVacationDays(request.startDate, request.endDate)} day(s)
                </p>
              </div>

              <div>
                <StatusBadge status={request.status} />
              </div>

              {canReview ? (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                  {isPendingAdminApproval(request.status) ? (
                    <>
                      <button onClick={() => updateStatus(request.id, "approve")} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#166534" }}>Approve</button>
                      <button onClick={() => updateStatus(request.id, "reject")} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #fecaca", backgroundColor: "#fef2f2", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>Reject</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                      {isPendingEmployeeConfirmation(request.status) ? "Waiting for employee" : "Handled"}
                    </span>
                  )}
                </div>
              ) : (
                isPendingEmployeeConfirmation(request.status) ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => confirmRequest(request.id)} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                      Confirm
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#475569", fontWeight: 700 }}>
                      {isPendingAdminApproval(request.status) ? "Waiting for admin" : "Submitted"}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{formatVacationDate(request.createdAt)}</p>
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
