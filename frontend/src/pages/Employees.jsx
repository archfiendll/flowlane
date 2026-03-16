import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import api from "../api/client";

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ value }) {
  const styles = {
    active:    { backgroundColor: "#dcfce7", color: "#166534" },
    inactive:  { backgroundColor: "#f1f5f9", color: "#64748b" },
    suspended: { backgroundColor: "#fef3c7", color: "#92400e" },
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

function EmployeeAvatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      color: "#1d4ed8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 800,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ActionChip({ children, tone = "neutral", style, ...props }) {
  const tones = {
    neutral: {
      backgroundColor: "#f8fafc",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
    primary: {
      backgroundColor: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    danger: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
  };

  return (
    <button
      {...props}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function InviteBadge({ invitation }) {
  if (!invitation) return null;

  const styles = {
    PENDING: { backgroundColor: "#eff6ff", color: "#1d4ed8", label: "Invite pending" },
    ACCEPTED: { backgroundColor: "#dcfce7", color: "#166534", label: "Invite accepted" },
    EXPIRED: { backgroundColor: "#fef3c7", color: "#92400e", label: "Invite expired" },
  };

  const style = styles[invitation.status] || {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    label: invitation.status,
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        ...style,
      }}
    >
      {style.label}
    </span>
  );
}

function formatInviteMeta(invitation) {
  if (!invitation) return "";

  if (invitation.status === "PENDING" && invitation.expiresAt) {
    return `Expires ${new Date(invitation.expiresAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  if (invitation.status === "ACCEPTED" && invitation.acceptedAt) {
    return `Accepted ${new Date(invitation.acceptedAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  if (invitation.status === "EXPIRED" && invitation.expiresAt) {
    return `Expired ${new Date(invitation.expiresAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  return "";
}

// ─── Input helpers ────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "9px 12px",
  border: "1.5px solid #cbd5e1", borderRadius: 8,
  fontSize: 14, color: "#1e293b", backgroundColor: "#f8fafc",
  outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", letterSpacing: "1.5px",
  textTransform: "uppercase", marginBottom: 5,
};
function Field({ label, children, hint, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error ? (
        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#b91c1c" }}>{error}</p>
      ) : hint ? (
        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#94a3b8" }}>{hint}</p>
      ) : null}
    </div>
  );
}

function buildInputStyle(error) {
  return error ? { ...inputStyle, borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : inputStyle;
}

function EmployeeTableSkeleton({ rows = 3, cols }) {
  return Array.from({ length: rows }, (_, i) => (
    <div key={i} style={{
      display: "grid", gridTemplateColumns: cols.join(" "),
      padding: "18px 24px", borderBottom: "1px solid #f1f5f9",
    }}>
      {[1, 2, 3, 4, 5, 6].map((j) => (
        <div key={j} style={{
          height: 14,
          backgroundColor: "#f1f5f9",
          borderRadius: 999,
          width: `${50 + j * 8}%`,
        }} />
      ))}
    </div>
  ));
}

function SectionSkeleton({ title = "Loading..." }) {
  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: 24,
    }}>
      <p style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "#64748b" }}>{title}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[...Array(6)].map((_, index) => (
          <div key={index} style={{ height: 14, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
        ))}
      </div>
    </div>
  );
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, letterSpacing: "1.4px", textTransform: "uppercase", fontWeight: 700, color: "#94a3b8" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "#334155", fontWeight: 600 }}>{value || "—"}</span>
    </div>
  );
}

function EmployeeDetailsDrawer({
  employee,
  loading,
  onClose,
  onEdit,
  onArchive,
  onRestore,
  archiving,
  restoring,
  canManage,
}) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15,23,42,0.28)",
      display: "flex",
      justifyContent: "flex-end",
      zIndex: 90,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 460,
        backgroundColor: "#fff",
        height: "100vh",
        boxShadow: "-18px 0 40px rgba(15,23,42,0.14)",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{
          padding: "22px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <EmployeeAvatar firstName={employee?.firstName} lastName={employee?.lastName} />
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
                {loading ? "Loading employee..." : `${employee?.firstName || ""} ${employee?.lastName || ""}`}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                {loading ? "Fetching details" : employee?.jobTitle || "Employee details"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8" }}>
            ✕
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          {loading || !employee ? (
            <>
              <SectionSkeleton title="Personal" />
              <SectionSkeleton title="Employment" />
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge value={employee.status?.toLowerCase()} />
                {employee.deletedAt ? <InviteBadge invitation={{ status: "EXPIRED" }} /> : null}
                {employee.user ? <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>Linked account</span> : null}
              </div>

              <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <DetailRow label="Personal Email" value={employee.personalEmail} />
                <DetailRow label="Phone" value={employee.phone} />
                <DetailRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                <DetailRow label="Nationality" value={employee.nationality} />
                <DetailRow label="Address" value={employee.address} />
                <DetailRow label="City" value={employee.city} />
              </section>

              <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <DetailRow label="Contract Number" value={employee.contractNumber} />
                <DetailRow label="Contract Type" value={employee.contractType === "FIXED_TERM" ? "Fixed term" : "Permanent"} />
                <DetailRow label="Start Date" value={formatDate(employee.startDate)} />
                <DetailRow label="Contract Date" value={formatDate(employee.contractDate)} />
                <DetailRow label="Working Hours" value={employee.workingHours === "PARTIAL" ? `Part time (${employee.partialHours || "—"}h)` : "Full time"} />
                <DetailRow label="Salary" value={employee.grossSalary ? `${employee.grossSalary} ${employee.currency}` : "—"} />
                <DetailRow label="Department" value={employee.department?.name} />
                <DetailRow label="Vacation Days / Year" value={employee.vacationDaysPerYear} />
              </section>
            </>
          )}
        </div>

        <div style={{
          padding: 20,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <ActionChip onClick={onClose}>Close</ActionChip>
          {canManage && employee && (
            <div style={{ display: "flex", gap: 8 }}>
              <ActionChip onClick={onEdit} disabled={Boolean(employee.deletedAt)}>Edit</ActionChip>
              {employee.deletedAt ? (
                <ActionChip tone="primary" onClick={onRestore} disabled={restoring}>
                  {restoring ? "Restoring..." : "Restore"}
                </ActionChip>
              ) : (
                <ActionChip tone="danger" onClick={onArchive} disabled={archiving}>
                  {archiving ? "Archiving..." : "Archive"}
                </ActionChip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = ["Personal", "Address", "Employment", "Vacation"];

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY = {
  firstName: "", lastName: "", dateOfBirth: "", placeOfBirth: "",
  nationality: "", citizenship: "", studies: "", phone: "", personalEmail: "",
  address: "", city: "", region: "", country: "", postalCode: "",
  departmentId: "",
  jobTitle: "", workLocation: "", startDate: "", contractType: "PERMANENT",
  contractEndDate: "", contractNumber: "", contractDate: "",
  workingHours: "FULL", partialHours: "", probationDays: "",
  grossSalary: "", currency: "RON",
  vacationDaysPerYear: 20,
};

const STEP_FIELDS = {
  0: ["firstName", "lastName", "personalEmail"],
  1: [],
  2: ["jobTitle", "startDate", "contractNumber", "contractDate", "grossSalary"],
  3: ["vacationDaysPerYear"],
};

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function mapEmployeeToForm(employee) {
  return {
    firstName: employee.firstName ?? "",
    lastName: employee.lastName ?? "",
    dateOfBirth: toInputDate(employee.dateOfBirth),
    placeOfBirth: employee.placeOfBirth ?? "",
    nationality: employee.nationality ?? "",
    citizenship: employee.citizenship ?? "",
    studies: employee.studies ?? "",
    phone: employee.phone ?? "",
    personalEmail: employee.personalEmail ?? "",
    address: employee.address ?? "",
    city: employee.city ?? "",
    region: employee.region ?? "",
    country: employee.country ?? "",
    postalCode: employee.postalCode ?? "",
    departmentId: employee.departmentId ? String(employee.departmentId) : "",
    jobTitle: employee.jobTitle ?? "",
    workLocation: employee.workLocation ?? "",
    startDate: toInputDate(employee.startDate),
    contractType: employee.contractType ?? "PERMANENT",
    contractEndDate: toInputDate(employee.contractEndDate),
    contractNumber: employee.contractNumber ?? "",
    contractDate: toInputDate(employee.contractDate),
    workingHours: employee.workingHours ?? "FULL",
    partialHours: employee.partialHours ?? "",
    probationDays: employee.probationDays ?? "",
    grossSalary: employee.grossSalary ?? "",
    currency: employee.currency ?? "RON",
    vacationDaysPerYear: employee.vacationDaysPerYear ?? 20,
  };
}

function buildEmployeePayload(form) {
  const toDate = (val) => val ? new Date(val).toISOString() : null;

  return {
    ...form,
    departmentId: form.departmentId ? parseInt(form.departmentId, 10) : null,
    dateOfBirth: toDate(form.dateOfBirth),
    startDate: toDate(form.startDate),
    contractDate: toDate(form.contractDate),
    contractEndDate: toDate(form.contractEndDate),
    probationDays: form.probationDays ? parseInt(form.probationDays, 10) : null,
    grossSalary: parseFloat(form.grossSalary),
    vacationDaysPerYear: parseInt(form.vacationDaysPerYear, 10),
    partialHours: form.partialHours ? parseFloat(form.partialHours) : null,
  };
}

function validateEmployeeForm(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (form.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail)) {
    errors.personalEmail = "Enter a valid email address.";
  }
  if (!form.jobTitle.trim()) errors.jobTitle = "Job title is required.";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.contractNumber.trim()) errors.contractNumber = "Contract number is required.";
  if (!form.contractDate) errors.contractDate = "Contract date is required.";
  if (!form.grossSalary || Number(form.grossSalary) <= 0) errors.grossSalary = "Gross salary must be greater than 0.";
  if (!form.vacationDaysPerYear || Number(form.vacationDaysPerYear) <= 0) {
    errors.vacationDaysPerYear = "Vacation days must be greater than 0.";
  }
  if (form.contractType === "FIXED_TERM" && !form.contractEndDate) {
    errors.contractEndDate = "Contract end date is required for fixed-term contracts.";
  }
  if (form.workingHours === "PARTIAL" && (!form.partialHours || Number(form.partialHours) <= 0)) {
    errors.partialHours = "Partial hours must be greater than 0.";
  }

  return errors;
}

// ─── Add Employee Modal ───────────────────────────────────────────────────────
function EmployeeModal({ mode = "create", employeeId = null, departments = [], onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
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

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
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

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep(s => Math.max(s - 1, 0));

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
      setError(
        err.response?.data?.error?.message
        || `Failed to ${mode === "edit" ? "update" : "create"} employee.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 24,
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: 20,
        width: "100%", maxWidth: 720,
        boxShadow: "0 24px 80px rgba(15,23,42,0.18)",
        display: "flex", flexDirection: "column", maxHeight: "90vh",
        border: "1px solid rgba(226,232,240,0.9)",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              {mode === "edit" ? "Edit Employee" : "Add Employee"}
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 20, color: "#94a3b8", lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: "14px 24px 12px", display: "flex", gap: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 4,
              backgroundColor: i <= step ? "#1d6fc4" : "#e2e8f0",
              transition: "background-color 0.2s",
            }} />
          ))}
        </div>

        {/* Form content */}
        <div style={{ padding: "8px 24px 24px", overflowY: "auto", flex: 1 }}>
          {loadingEmployee ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading employee...</p>
          ) : (
            <>

          {/* Step 1 — Personal */}
          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="First Name *">
                <input style={buildInputStyle(fieldErrors.firstName)} value={form.firstName} onChange={set("firstName")} placeholder="John" required />
              </Field>
              <Field label="Last Name *">
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
          )}

          {/* Step 2 — Address */}
          {step === 1 && (
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
          )}

          {/* Step 3 — Employment */}
          {step === 2 && (
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
              {form.contractType === "FIXED_TERM" && (
                <Field label="Contract End Date" error={fieldErrors.contractEndDate}>
                  <input type="date" style={buildInputStyle(fieldErrors.contractEndDate)} value={form.contractEndDate} onChange={set("contractEndDate")} />
                </Field>
              )}
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
              {form.workingHours === "PARTIAL" && (
                <Field label="Partial Hours" error={fieldErrors.partialHours}>
                  <input type="number" style={buildInputStyle(fieldErrors.partialHours)} value={form.partialHours} onChange={set("partialHours")} placeholder="4" />
                </Field>
              )}
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
          )}

          {/* Step 4 — Vacation */}
          {step === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Vacation Days / Year *" error={fieldErrors.vacationDaysPerYear}>
                <input type="number" style={buildInputStyle(fieldErrors.vacationDaysPerYear)} value={form.vacationDaysPerYear} onChange={set("vacationDaysPerYear")} placeholder="20" />
              </Field>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 16, padding: "10px 14px", backgroundColor: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 8,
              color: "#b91c1c", fontSize: 13,
            }}>{error}</div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid #e2e8f0",
          display: "flex", justifyContent: "space-between",
        }}>
          <button
            type="button"
            onClick={step === 0 ? onClose : back}
            style={{
              padding: "9px 20px", backgroundColor: "transparent",
              border: "1.5px solid #e2e8f0", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
            }}
            disabled={loadingEmployee || saving}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} disabled={loadingEmployee} style={{
              padding: "9px 20px", backgroundColor: "#1d6fc4",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
            }}>
              Next →
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={saving || loadingEmployee} style={{
              padding: "9px 20px",
              backgroundColor: saving ? "#93c5fd" : "#1d6fc4",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving..." : mode === "edit" ? "Update Employee" : "Save Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get("departmentId") || "");
  const [archivedFilter, setArchivedFilter] = useState("active");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingSelectedEmployee, setLoadingSelectedEmployee] = useState(false);
  const [sendingInviteFor, setSendingInviteFor] = useState(null);
  const [deactivatingEmployeeId, setDeactivatingEmployeeId] = useState(null);
  const [restoringEmployeeId, setRestoringEmployeeId] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const viewingArchived = archivedFilter === "archived";
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 350);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/employees", {
        params: {
          q: debouncedSearchQuery || undefined,
          status: statusFilter || undefined,
          departmentId: departmentFilter || undefined,
          archived: archivedFilter,
          sortBy,
          sortOrder,
          page,
        },
      });
      setRows(res.data.data.data ?? []);
      setMeta(res.data.data.meta ?? { page: 1, pages: 1, total: 0, limit: 20 });
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadDepartments() {
      try {
        const res = await api.get("/departments");
        if (!cancelled) setDepartments(res.data.data.departments ?? []);
      } catch (_err) {
        if (!cancelled) setDepartments([]);
      }
    }

    loadDepartments();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [archivedFilter, debouncedSearchQuery, departmentFilter, sortBy, sortOrder, statusFilter]);

  useEffect(() => { load(); }, [archivedFilter, debouncedSearchQuery, departmentFilter, page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedEmployee() {
      if (!selectedEmployeeId) {
        setSelectedEmployee(null);
        return;
      }

      setLoadingSelectedEmployee(true);
      try {
        const res = await api.get(`/employees/${selectedEmployeeId}`);
        if (!cancelled) {
          setSelectedEmployee(res.data.data.employee);
        }
      } catch (_err) {
        if (!cancelled) {
          setSelectedEmployee(null);
          setNotice({ type: "error", message: "Failed to load employee details." });
        }
      } finally {
        if (!cancelled) setLoadingSelectedEmployee(false);
      }
    }

    loadSelectedEmployee();
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId]);

  const openCreateModal = () => {
    setEditingEmployeeId(null);
    setShowModal(true);
  };

  const openEditModal = (employeeId) => {
    setEditingEmployeeId(employeeId);
    setShowModal(true);
  };

  const openDetailsDrawer = (employeeId) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleSaved = async (action) => {
    await load();
    if (selectedEmployeeId) {
      const res = await api.get(`/employees/${selectedEmployeeId}`);
      setSelectedEmployee(res.data.data.employee);
    }
    setNotice({
      type: "success",
      message: `Employee ${action === "updated" ? "updated" : "created"} successfully.`,
    });
  };

  const handleDeactivate = async (employee) => {
    const confirmed = window.confirm(`Archive ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    setDeactivatingEmployeeId(employee.id);
    setNotice(null);
    try {
      await api.delete(`/employees/${employee.id}`);
      await load();
      if (selectedEmployeeId === employee.id) {
        const res = await api.get(`/employees/${employee.id}`);
        setSelectedEmployee(res.data.data.employee);
      }
      setNotice({
        type: "success",
        message: `${employee.firstName} ${employee.lastName} was archived.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.error?.message || "Failed to deactivate employee.",
      });
    } finally {
      setDeactivatingEmployeeId(null);
    }
  };

  const handleRestore = async (employee) => {
    setRestoringEmployeeId(employee.id);
    setNotice(null);
    try {
      await api.post(`/employees/${employee.id}/restore`);
      await load();
      if (selectedEmployeeId === employee.id) {
        const res = await api.get(`/employees/${employee.id}`);
        setSelectedEmployee(res.data.data.employee);
      }
      setNotice({
        type: "success",
        message: `${employee.firstName} ${employee.lastName} was restored.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.error?.message || "Failed to restore employee.",
      });
    } finally {
      setRestoringEmployeeId(null);
    }
  };

  const handleInvite = async (employee) => {
    setSendingInviteFor(employee.id);
    setNotice(null);
    try {
      const res = await api.post("/invitations", {
        email: employee.personalEmail,
        role: "employee",
      });
      const invitation = res.data.data.invitation;
      setRows((current) =>
        current.map((row) =>
          row.id === employee.id
            ? {
                ...row,
                invitation: {
                  status: "PENDING",
                  email: invitation.email,
                  createdAt: new Date().toISOString(),
                },
              }
            : row
        )
      );
      setNotice({
        type: "success",
        message: `Invite sent to ${employee.personalEmail}.`,
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.response?.data?.error?.message || "Failed to send invite.",
      });
    } finally {
      setSendingInviteFor(null);
    }
  };

  const cols = ["72px", "1.4fr", "1fr", "140px", "140px", "250px"];
  const emptyTitle = viewingArchived
    ? "No archived employees yet"
    : debouncedSearchQuery || statusFilter
      ? "No employees match these filters"
      : "No employees yet";
  const emptyCopy = viewingArchived
    ? "Archived employees will appear here, and you’ll be able to restore them when needed."
    : debouncedSearchQuery || statusFilter
      ? "Try clearing filters or adjusting the search to find the employee you're looking for."
      : "Add your first employee to start building the company directory.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Heading */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "22px 24px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
      }}>
        <div>
          <p style={{
            margin: "0 0 8px 0",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}>
            Workforce Directory
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: "0 0 6px 0" }}>
            Employees
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
              fontWeight: 700,
            }}>
              {loading ? "Loading..." : `${meta.total} employee${meta.total !== 1 ? "s" : ""}`}
            </span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              Click a row to view details before editing.
            </span>
            {departmentFilter ? (
              <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700 }}>
                Filtered by department
              </span>
            ) : null}
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg, #2b79cb 0%, #1d6fc4 100%)",
              border: "none",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 10px 22px rgba(29,111,196,0.22)",
            }}
            onMouseEnter={e => e.target.style.backgroundColor = "#1559a0"}
            onMouseLeave={e => e.target.style.backgroundColor = "#1d6fc4"}
          >
            + Add Employee
          </button>
        )}
      </div>

      {notice && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            fontSize: 13,
            border: `1px solid ${notice.type === "error" ? "#fecaca" : "#bbf7d0"}`,
            backgroundColor: notice.type === "error" ? "#fef2f2" : "#f0fdf4",
            color: notice.type === "error" ? "#b91c1c" : "#166534",
          }}
        >
          {notice.message}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
          { value: "all", label: "All" },
        ].map((option) => {
          const active = archivedFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setArchivedFilter(option.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "#93c5fd" : "#e2e8f0"}`,
                backgroundColor: active ? "#eff6ff" : "#fff",
                color: active ? "#1d4ed8" : "#64748b",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1.4fr) 180px 160px 160px 180px auto",
        gap: 12,
        alignItems: "end",
        padding: "16px",
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
      }}>
        <Field label="Search">
          <input
            style={inputStyle}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, or email"
          />
        </Field>
        <Field label="Status">
          <select style={inputStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </Field>
        <Field label="Department">
          <select
            style={inputStyle}
            value={departmentFilter}
            onChange={(e) => {
              const value = e.target.value;
              setDepartmentFilter(value);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("departmentId", value);
                else next.delete("departmentId");
                return next;
              });
            }}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        </Field>
        <Field label="View">
          <select style={inputStyle} value={archivedFilter} onChange={(e) => setArchivedFilter(e.target.value)}>
            <option value="active">Active only</option>
            <option value="archived">Archived only</option>
            <option value="all">All employees</option>
          </select>
        </Field>
        <Field label="Sort">
          <select
            style={inputStyle}
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [nextSortBy, nextSortOrder] = e.target.value.split(":");
              setSortBy(nextSortBy);
              setSortOrder(nextSortOrder);
            }}
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="name:asc">Name A-Z</option>
            <option value="name:desc">Name Z-A</option>
            <option value="startDate:desc">Latest start date</option>
            <option value="startDate:asc">Earliest start date</option>
          </select>
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ActionChip
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setDepartmentFilter("");
              setArchivedFilter("active");
              setSortBy("createdAt");
              setSortOrder("desc");
              setPage(1);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.delete("departmentId");
                return next;
              });
            }}
          >
            Reset filters
          </ActionChip>
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 16px 36px rgba(15,23,42,0.05)",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: cols.join(" "),
          padding: "14px 24px", backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          {["ID", "Name", "Job Title", "Status", "Department", ""].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>{h}</span>
          ))}
        </div>

        {loading && <EmployeeTableSkeleton rows={3} cols={cols} />}

        {!loading && rows.length === 0 && (
          <div style={{ padding: "56px 20px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{viewingArchived ? "🗂️" : "👤"}</div>
            <p style={{ fontSize: 16, margin: "0 0 8px 0", color: "#334155", fontWeight: 700 }}>{emptyTitle}</p>
            <p style={{ fontSize: 13, margin: "0 0 18px 0" }}>{emptyCopy}</p>
            {(searchQuery || statusFilter || departmentFilter || archivedFilter !== "active") && (
              <ActionChip
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setDepartmentFilter("");
                  setArchivedFilter("active");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                  setPage(1);
                  setSearchParams((current) => {
                    const next = new URLSearchParams(current);
                    next.delete("departmentId");
                    return next;
                  });
                }}
              >
                Clear filters
              </ActionChip>
            )}
            {!viewingArchived && !searchQuery && !statusFilter && isAdmin && (
              <div style={{ marginTop: 12 }}>
                <ActionChip tone="primary" onClick={openCreateModal}>
                  Add first employee
                </ActionChip>
              </div>
            )}
          </div>
        )}

        {!loading && rows.map((u, i) => (
          <div
            key={u.id}
            onClick={() => openDetailsDrawer(u.id)}
            onMouseEnter={() => setHoveredRow(u.id)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: "grid", gridTemplateColumns: cols.join(" "),
              padding: "18px 24px", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: hoveredRow === u.id ? "#f8fafc" : "#fff",
              transition: "background-color 0.12s ease, transform 0.12s ease",
              cursor: "pointer",
              transform: hoveredRow === u.id ? "translateY(-1px)" : "none",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{u.id}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <EmployeeAvatar firstName={u.firstName} lastName={u.lastName} />
              <div style={{ minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#334155",
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {u.firstName} {u.lastName}
                </p>
                <p style={{
                  margin: "3px 0 0 0",
                  fontSize: 12,
                  color: u.deletedAt ? "#c2410c" : "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {u.deletedAt ? "Archived employee record" : (u.personalEmail || "No personal email")}
                </p>
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", fontWeight: 600 }}>{u.jobTitle}</p>
              <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                {u.contractType === "FIXED_TERM" ? "Fixed term" : "Permanent"}
              </p>
            </div>
            <span><Badge value={u.status?.toLowerCase()} /></span>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{u.department?.name ?? "Unassigned"}</span>
            <span>
              {isAdmin && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <ActionChip
                      onClick={(e) => { e.stopPropagation(); openEditModal(u.id); }}
                      disabled={Boolean(u.deletedAt)}
                    >
                      Edit
                    </ActionChip>
                    {u.deletedAt ? (
                      <ActionChip
                        onClick={(e) => { e.stopPropagation(); handleRestore(u); }}
                        disabled={restoringEmployeeId === u.id}
                        tone="primary"
                      >
                        {restoringEmployeeId === u.id ? "Restoring..." : "Restore"}
                      </ActionChip>
                    ) : (
                      <ActionChip
                        onClick={(e) => { e.stopPropagation(); handleDeactivate(u); }}
                        disabled={deactivatingEmployeeId === u.id}
                        tone="danger"
                        style={{ backgroundColor: deactivatingEmployeeId === u.id ? "#fee2e2" : undefined }}
                      >
                        {deactivatingEmployeeId === u.id ? "Archiving..." : "Archive"}
                      </ActionChip>
                    )}
                    {u.user ? (
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Joined</span>
                    ) : !u.deletedAt ? (
                      <>
                        <InviteBadge invitation={u.invitation} />
                        <ActionChip
                          title={!u.personalEmail ? "Add personal email first" : "Send invite"}
                          disabled={!u.personalEmail || sendingInviteFor === u.id}
                          onClick={(e) => { e.stopPropagation(); handleInvite(u); }}
                          tone="primary"
                          style={{
                            backgroundColor: u.personalEmail ? undefined : "#f1f5f9",
                            color: u.personalEmail ? undefined : "#94a3b8",
                            border: u.personalEmail ? undefined : "1px solid #e2e8f0",
                          }}
                        >
                          {sendingInviteFor === u.id
                            ? "Sending..."
                            : u.invitation?.status === "PENDING"
                              ? "Resend"
                              : "Invite"}
                        </ActionChip>
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Archived</span>
                    )}
                  </div>
                  {u.user && (
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
                      Account already linked
                    </p>
                  )}
                </div>
              )}
              {!u.user && u.invitation && (
                <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
                  {formatInviteMeta(u.invitation)}
                </p>
              )}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
          Page {meta.page} of {meta.pages || 1}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <ActionChip onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>
            Previous
          </ActionChip>
          <ActionChip onClick={() => setPage((current) => Math.min(meta.pages || 1, current + 1))} disabled={page >= (meta.pages || 1) || loading}>
            Next
          </ActionChip>
        </div>
      </div>

      {error && !loading && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 12,
          backgroundColor: "#fff7ed",
          border: "1px solid #fdba74",
          color: "#9a3412",
        }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: 13, fontWeight: 700 }}>Something went wrong while loading employees.</p>
            <p style={{ margin: 0, fontSize: 12 }}>{error}</p>
          </div>
          <ActionChip tone="primary" onClick={load}>
            Retry
          </ActionChip>
        </div>
      )}

      {showModal && (
        <EmployeeModal
          mode={editingEmployeeId ? "edit" : "create"}
          employeeId={editingEmployeeId}
          departments={departments}
          onClose={() => {
            setShowModal(false);
            setEditingEmployeeId(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {selectedEmployeeId && (
        <EmployeeDetailsDrawer
          employee={selectedEmployee}
          loading={loadingSelectedEmployee}
          onClose={() => {
            setSelectedEmployeeId(null);
            setSelectedEmployee(null);
          }}
          onEdit={() => selectedEmployeeId && openEditModal(selectedEmployeeId)}
          onArchive={() => selectedEmployee && handleDeactivate(selectedEmployee)}
          onRestore={() => selectedEmployee && handleRestore(selectedEmployee)}
          archiving={deactivatingEmployeeId === selectedEmployeeId}
          restoring={restoringEmployeeId === selectedEmployeeId}
          canManage={isAdmin}
        />
      )}
    </div>
  );
}
