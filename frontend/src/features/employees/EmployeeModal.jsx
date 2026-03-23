import { useEffect, useState } from "react";
import api from "../../api/client";
import { EMPTY_EMPLOYEE_FORM, STEPS, STEP_FIELDS, buildEmployeePayload, mapEmployeeToForm, validateEmployeeForm } from "./form.js";
import { Field, buildInputStyle, inputStyle } from "./utils.jsx";

export function EmployeeModal({ mode = "create", employeeId = null, departments = [], onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_EMPLOYEE_FORM);
  const [saving, setSaving] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(mode === "edit");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadEmployee() {
      if (mode !== "edit" || !employeeId) return;
      setLoadingEmployee(true);
      setError("");
      try {
        const res = await api.get(`/employees/${employeeId}`);
        if (!cancelled) {
          setForm(mapEmployeeToForm(res.data.data.employee));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error?.message || "Failed to load employee.");
        }
      } finally {
        if (!cancelled) setLoadingEmployee(false);
      }
    }

    loadEmployee();
    return () => {
      cancelled = true;
    };
  }, [employeeId, mode]);

  const set = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const next = () => {
    const validationErrors = validateEmployeeForm(form);
    const visibleErrors = STEP_FIELDS[step].reduce((acc, field) => {
      if (validationErrors[field]) acc[field] = validationErrors[field];
      return acc;
    }, {});

    if (Object.keys(visibleErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...visibleErrors }));
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const back = () => setStep((current) => Math.max(current - 1, 0));

  const submit = async () => {
    setSaving(true);
    setError("");
    const validationErrors = validateEmployeeForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSaving(false);
      return;
    }

    try {
      const payload = buildEmployeePayload(form);
      if (mode === "edit" && employeeId) {
        await api.put(`/employees/${employeeId}`, payload);
      } else {
        await api.post("/employees", payload);
      }
      onSaved(mode === "edit" ? "updated" : "created");
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || `Failed to ${mode === "edit" ? "update" : "create"} employee.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 720,
          boxShadow: "0 24px 80px rgba(15,23,42,0.18)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          border: "1px solid rgba(226,232,240,0.9)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              {mode === "edit" ? "Edit Employee" : "Add Employee"}
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8", lineHeight: 1 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: "14px 24px 12px", display: "flex", gap: 8 }}>
          {STEPS.map((item, index) => (
            <div
              key={item}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                backgroundColor: index <= step ? "#1d6fc4" : "#e2e8f0",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </div>

        <div style={{ padding: "8px 24px 24px", overflowY: "auto", flex: 1 }}>
          {loadingEmployee ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading employee...</p>
          ) : (
            <>
              {step === 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="First Name *" error={fieldErrors.firstName}>
                    <input style={buildInputStyle(fieldErrors.firstName)} value={form.firstName} onChange={set("firstName")} placeholder="John" required />
                  </Field>
                  <Field label="Last Name *" error={fieldErrors.lastName}>
                    <input style={buildInputStyle(fieldErrors.lastName)} value={form.lastName} onChange={set("lastName")} placeholder="Doe" required />
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" style={inputStyle} value={form.dateOfBirth} onChange={set("dateOfBirth")} />
                  </Field>
                  <Field label="Place of Birth">
                    <input style={inputStyle} value={form.placeOfBirth} onChange={set("placeOfBirth")} placeholder="Cluj-Napoca" />
                  </Field>
                  <Field label="Nationality">
                    <input style={inputStyle} value={form.nationality} onChange={set("nationality")} placeholder="Romanian" />
                  </Field>
                  <Field label="Citizenship">
                    <input style={inputStyle} value={form.citizenship} onChange={set("citizenship")} placeholder="Romanian" />
                  </Field>
                  <Field label="Studies">
                    <input style={inputStyle} value={form.studies} onChange={set("studies")} placeholder="Bachelor's degree" />
                  </Field>
                  <Field label="Phone">
                    <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="+40 700 000 000" />
                  </Field>
                  <Field label="Personal Email" error={fieldErrors.personalEmail}>
                    <input type="email" style={buildInputStyle(fieldErrors.personalEmail)} value={form.personalEmail} onChange={set("personalEmail")} placeholder="john@gmail.com" />
                  </Field>
                </div>
              ) : null}

              {step === 1 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Address">
                    <input style={inputStyle} value={form.address} onChange={set("address")} placeholder="Str. Exemplu nr. 1" />
                  </Field>
                  <Field label="City">
                    <input style={inputStyle} value={form.city} onChange={set("city")} placeholder="Cluj-Napoca" />
                  </Field>
                  <Field label="Region / County">
                    <input style={inputStyle} value={form.region} onChange={set("region")} placeholder="Cluj" />
                  </Field>
                  <Field label="Country">
                    <input style={inputStyle} value={form.country} onChange={set("country")} placeholder="RO" />
                  </Field>
                  <Field label="Postal Code">
                    <input style={inputStyle} value={form.postalCode} onChange={set("postalCode")} placeholder="400000" />
                  </Field>
                </div>
              ) : null}

              {step === 2 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Job Title *" error={fieldErrors.jobTitle}>
                    <input style={buildInputStyle(fieldErrors.jobTitle)} value={form.jobTitle} onChange={set("jobTitle")} placeholder="Software Engineer" required />
                  </Field>
                  <Field label="Department" hint={departments.length === 0 ? "Create departments first to assign employees to teams." : undefined}>
                    <select style={inputStyle} value={form.departmentId} onChange={set("departmentId")}>
                      <option value="">Unassigned</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>{department.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Work Location">
                    <input style={inputStyle} value={form.workLocation} onChange={set("workLocation")} placeholder="Cluj-Napoca" />
                  </Field>
                  <Field label="Start Date *" error={fieldErrors.startDate}>
                    <input type="date" style={buildInputStyle(fieldErrors.startDate)} value={form.startDate} onChange={set("startDate")} required />
                  </Field>
                  <Field label="Contract Type *">
                    <select style={inputStyle} value={form.contractType} onChange={set("contractType")}>
                      <option value="PERMANENT">Permanent</option>
                      <option value="FIXED_TERM">Fixed Term</option>
                    </select>
                  </Field>
                  {form.contractType === "FIXED_TERM" ? (
                    <Field label="Contract End Date" error={fieldErrors.contractEndDate}>
                      <input type="date" style={buildInputStyle(fieldErrors.contractEndDate)} value={form.contractEndDate} onChange={set("contractEndDate")} />
                    </Field>
                  ) : null}
                  <Field label="Contract Number *" error={fieldErrors.contractNumber}>
                    <input style={buildInputStyle(fieldErrors.contractNumber)} value={form.contractNumber} onChange={set("contractNumber")} placeholder="001/2026" />
                  </Field>
                  <Field label="Contract Date *" error={fieldErrors.contractDate}>
                    <input type="date" style={buildInputStyle(fieldErrors.contractDate)} value={form.contractDate} onChange={set("contractDate")} />
                  </Field>
                  <Field label="Working Hours *">
                    <select style={inputStyle} value={form.workingHours} onChange={set("workingHours")}>
                      <option value="FULL">Full time</option>
                      <option value="PARTIAL">Part time</option>
                    </select>
                  </Field>
                  {form.workingHours === "PARTIAL" ? (
                    <Field label="Partial Hours" error={fieldErrors.partialHours}>
                      <input type="number" style={buildInputStyle(fieldErrors.partialHours)} value={form.partialHours} onChange={set("partialHours")} placeholder="4" />
                    </Field>
                  ) : null}
                  <Field label="Gross Salary *" error={fieldErrors.grossSalary}>
                    <input type="number" style={buildInputStyle(fieldErrors.grossSalary)} value={form.grossSalary} onChange={set("grossSalary")} placeholder="5000" />
                  </Field>
                  <Field label="Currency *">
                    <select style={inputStyle} value={form.currency} onChange={set("currency")}>
                      <option value="RON">RON</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                    </select>
                  </Field>
                  <Field label="Probation Days">
                    <input type="number" style={inputStyle} value={form.probationDays} onChange={set("probationDays")} placeholder="90" />
                  </Field>
                </div>
              ) : null}

              {step === 3 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Vacation Days / Year *" error={fieldErrors.vacationDaysPerYear}>
                    <input type="number" style={buildInputStyle(fieldErrors.vacationDaysPerYear)} value={form.vacationDaysPerYear} onChange={set("vacationDaysPerYear")} placeholder="20" />
                  </Field>
                </div>
              ) : null}

              {error ? (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 14px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#b91c1c",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            onClick={step === 0 ? onClose : back}
            style={{
              padding: "9px 20px",
              backgroundColor: "transparent",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
            disabled={loadingEmployee || saving}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={loadingEmployee}
              style={{
                padding: "9px 20px",
                backgroundColor: "#1d6fc4",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={saving || loadingEmployee}
              style={{
                padding: "9px 20px",
                backgroundColor: saving ? "#93c5fd" : "#1d6fc4",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : mode === "edit" ? "Update Employee" : "Save Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

