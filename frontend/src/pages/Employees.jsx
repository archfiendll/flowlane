import { useEffect, useState } from "react";
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
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      {children}
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
  jobTitle: "", workLocation: "", startDate: "", contractType: "PERMANENT",
  contractEndDate: "", contractNumber: "", contractDate: "",
  workingHours: "FULL", partialHours: "", probationDays: "",
  grossSalary: "", currency: "RON",
  vacationDaysPerYear: 20,
};

// ─── Add Employee Modal ───────────────────────────────────────────────────────
function AddEmployeeModal({ onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
  setSaving(true);
  setError("");
  try {
    const toDate = (val) => val ? new Date(val).toISOString() : null;

    const payload = {
      ...form,
      dateOfBirth: toDate(form.dateOfBirth),
      startDate: toDate(form.startDate),
      contractDate: toDate(form.contractDate),
      contractEndDate: toDate(form.contractEndDate),
      probationDays: form.probationDays ? parseInt(form.probationDays) : null,
      grossSalary: parseFloat(form.grossSalary),
      vacationDaysPerYear: parseInt(form.vacationDaysPerYear),
      partialHours: form.partialHours ? parseFloat(form.partialHours) : null,
    };

    await api.post("/employees", payload);
    onSaved();
    onClose();
  } catch (err) {
    setError(err.response?.data?.error?.message || "Failed to create employee.");
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
        backgroundColor: "#fff", borderRadius: 16,
        width: "100%", maxWidth: 560,
        boxShadow: "0 8px 48px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column", maxHeight: "90vh",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              Add Employee
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
        <div style={{ padding: "12px 24px", display: "flex", gap: 8 }}>
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

          {/* Step 1 — Personal */}
          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="First Name *">
                <input style={inputStyle} value={form.firstName} onChange={set("firstName")} placeholder="John" required />
              </Field>
              <Field label="Last Name *">
                <input style={inputStyle} value={form.lastName} onChange={set("lastName")} placeholder="Doe" required />
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
              <Field label="Personal Email">
                <input type="email" style={inputStyle} value={form.personalEmail} onChange={set("personalEmail")} placeholder="john@gmail.com" />
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
              <Field label="Job Title *">
                <input style={inputStyle} value={form.jobTitle} onChange={set("jobTitle")} placeholder="Software Engineer" required />
              </Field>
              <Field label="Work Location">
                <input style={inputStyle} value={form.workLocation} onChange={set("workLocation")} placeholder="Cluj-Napoca" />
              </Field>
              <Field label="Start Date *">
                <input type="date" style={inputStyle} value={form.startDate} onChange={set("startDate")} required />
              </Field>
              <Field label="Contract Type *">
                <select style={inputStyle} value={form.contractType} onChange={set("contractType")}>
                  <option value="PERMANENT">Permanent</option>
                  <option value="FIXED_TERM">Fixed Term</option>
                </select>
              </Field>
              {form.contractType === "FIXED_TERM" && (
                <Field label="Contract End Date">
                  <input type="date" style={inputStyle} value={form.contractEndDate} onChange={set("contractEndDate")} />
                </Field>
              )}
              <Field label="Contract Number *">
                <input style={inputStyle} value={form.contractNumber} onChange={set("contractNumber")} placeholder="001/2026" />
              </Field>
              <Field label="Contract Date *">
                <input type="date" style={inputStyle} value={form.contractDate} onChange={set("contractDate")} />
              </Field>
              <Field label="Working Hours *">
                <select style={inputStyle} value={form.workingHours} onChange={set("workingHours")}>
                  <option value="FULL">Full time</option>
                  <option value="PARTIAL">Part time</option>
                </select>
              </Field>
              {form.workingHours === "PARTIAL" && (
                <Field label="Partial Hours">
                  <input type="number" style={inputStyle} value={form.partialHours} onChange={set("partialHours")} placeholder="4" />
                </Field>
              )}
              <Field label="Gross Salary *">
                <input type="number" style={inputStyle} value={form.grossSalary} onChange={set("grossSalary")} placeholder="5000" />
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
              <Field label="Vacation Days / Year *">
                <input type="number" style={inputStyle} value={form.vacationDaysPerYear} onChange={set("vacationDaysPerYear")} placeholder="20" />
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
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid #e2e8f0",
          display: "flex", justifyContent: "space-between",
        }}>
          <button
            onClick={step === 0 ? onClose : back}
            style={{
              padding: "9px 20px", backgroundColor: "transparent",
              border: "1.5px solid #e2e8f0", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
            }}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={next} style={{
              padding: "9px 20px", backgroundColor: "#1d6fc4",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
            }}>
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={saving} style={{
              padding: "9px 20px",
              backgroundColor: saving ? "#93c5fd" : "#1d6fc4",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving..." : "Save Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isAdmin = user?.role === "admin";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/employees");
      setRows(res.data.data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const cols = ["60px", "1fr", "1fr", "120px", "120px"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Heading */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Employees
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            {loading ? "Loading..." : `${rows.length} record${rows.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "9px 20px", backgroundColor: "#1d6fc4",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
            }}
            onMouseEnter={e => e.target.style.backgroundColor = "#1559a0"}
            onMouseLeave={e => e.target.style.backgroundColor = "#1d6fc4"}
          >
            + Add Employee
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", backgroundColor: "#fef2f2",
          border: "1px solid #fecaca", borderRadius: 8,
          color: "#b91c1c", fontSize: 13,
        }}>{error}</div>
      )}

      {/* Table */}
      <div style={{
        backgroundColor: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: cols.join(" "),
          padding: "10px 20px", backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          {["ID", "Name", "Job Title", "Status", "Department"].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94a3b8",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>{h}</span>
          ))}
        </div>

        {loading && [1, 2, 3].map(i => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: cols.join(" "),
            padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
          }}>
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} style={{
                height: 14, backgroundColor: "#f1f5f9",
                borderRadius: 4, width: `${50 + j * 8}%`,
              }} />
            ))}
          </div>
        ))}

        {!loading && rows.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
            <p style={{ fontSize: 14, margin: 0 }}>No employees found</p>
          </div>
        )}

        {!loading && rows.map((u, i) => (
          <div
            key={u.id}
            onMouseEnter={() => setHoveredRow(u.id)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: "grid", gridTemplateColumns: cols.join(" "),
              padding: "13px 20px", alignItems: "center",
              borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              backgroundColor: hoveredRow === u.id ? "#f8fafc" : "#fff",
              transition: "background-color 0.1s",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>#{u.id}</span>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{u.firstName} {u.lastName}</span>
            <span style={{ fontSize: 13, color: "#64748b" }}>{u.jobTitle}</span>
            <span><Badge value={u.status?.toLowerCase()} /></span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{u.department?.name ?? "—"}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}