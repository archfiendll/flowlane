import { useState } from "react";
import api from "../../api/client";
import { VacationDuration, VacationInput, VacationSelect, inputStyle } from "./ui.jsx";

export function VacationRequestModal({ canReview, employees, onClose, onSaved }) {
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

  const onSubmit = async (event) => {
    event.preventDefault();
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
              <VacationSelect
                style={fieldErrors.employeeId ? { borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : undefined}
                value={form.employeeId}
                onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}
              >
                <option value="">Choose employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} · {employee.jobTitle}
                  </option>
                ))}
              </VacationSelect>
            </div>
          ) : null}

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Leave Type
            </label>
            <VacationSelect value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
              <option value="ANNUAL">Annual</option>
              <option value="MEDICAL">Medical</option>
              <option value="PARENTAL">Parental</option>
              <option value="UNPAID">Unpaid</option>
            </VacationSelect>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Duration
            </label>
            <VacationDuration startDate={form.startDate} endDate={form.endDate} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Start Date
            </label>
            <VacationInput type="date" style={fieldErrors.startDate ? { borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : undefined} value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              End Date
            </label>
            <VacationInput type="date" style={fieldErrors.endDate ? { borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : undefined} value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Note
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
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

