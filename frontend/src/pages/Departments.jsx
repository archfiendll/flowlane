import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import api from "../api/client";

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1.5px solid #cbd5e1",
  borderRadius: 10,
  fontSize: 14,
  backgroundColor: "#f8fafc",
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        minWidth: 180,
        borderTop: `3px solid ${accent}`,
      }}
    >
      <p
        style={{
          margin: "0 0 8px 0",
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p style={{ margin: "0 0 4px 0", fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{sub}</p>
    </div>
  );
}

function DepartmentSkeleton() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 140px 180px",
            gap: 12,
            padding: "18px 20px",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: "48%", height: 16, borderRadius: 999, backgroundColor: "#e2e8f0" }} />
            <div style={{ width: "34%", height: 12, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
          </div>
          <div style={{ width: "58%", height: 14, borderRadius: 999, backgroundColor: "#f1f5f9", alignSelf: "center" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <div style={{ width: 64, height: 32, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
            <div style={{ width: 72, height: 32, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DepartmentModal({ department, onClose, onSaved }) {
  const [name, setName] = useState(department?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fieldError = !name.trim() ? "Department name is required." : "";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (department) {
        await api.put(`/departments/${department.id}`, { name: name.trim() });
      } else {
        await api.post("/departments", { name: name.trim() });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.36)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 460,
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
          <h2 style={{ margin: "0 0 6px 0", fontSize: 22, color: "#1e293b" }}>
            {department ? "Edit Department" : "Create Department"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Group employees into a team that can be assigned from employee records and used in filters later.
          </p>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 11,
              color: "#64748b",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Department Name
          </label>
          <input
            style={fieldError ? { ...inputStyle, borderColor: "#fca5a5", backgroundColor: "#fff7f7" } : inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="People Operations"
            autoFocus
          />
          {error ? <p style={{ margin: "8px 0 0 0", color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              backgroundColor: "#1d6fc4",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {saving ? "Saving..." : department ? "Save Changes" : "Create Department"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Departments() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data.departments ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const totalEmployees = departments.reduce((sum, department) => sum + (department._count?.employees ?? 0), 0);
    const largestDepartment = departments.reduce(
      (largest, department) =>
        (department._count?.employees ?? 0) > (largest?._count?.employees ?? -1) ? department : largest,
      null,
    );

    return {
      totalDepartments: departments.length,
      totalEmployees,
      largestDepartment,
    };
  }, [departments]);

  const removeDepartment = async (department) => {
    const confirmed = window.confirm(`Delete ${department.name}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/departments/${department.id}`);
      setNotice(`${department.name} deleted.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to delete department.");
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
          <h1 style={{ margin: "0 0 8px 0", fontSize: 30, color: "#1e293b" }}>Departments</h1>
          <p style={{ margin: "0 0 14px 0", color: "#64748b", fontSize: 14, maxWidth: 620 }}>
            Organize employees into clear teams, then use departments across employee management, vacations, and invite tracking.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: "#fff",
                border: "1px solid #dbeafe",
                fontSize: 12,
                color: "#1d4ed8",
                fontWeight: 700,
              }}
            >
              {summary.totalDepartments} teams
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                fontSize: 12,
                color: "#475569",
                fontWeight: 700,
              }}
            >
              {summary.totalEmployees} assigned employees
            </span>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setEditingDepartment(null);
              setShowModal(true);
            }}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              backgroundColor: "#1d6fc4",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 12px 30px rgba(29,111,196,0.2)",
            }}
          >
            + New Department
          </button>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard
          label="Departments"
          value={summary.totalDepartments}
          sub="Active teams in the company"
          accent="#1d6fc4"
        />
        <StatCard
          label="Assigned Employees"
          value={summary.totalEmployees}
          sub="Employees linked to a department"
          accent="#0f766e"
        />
        <StatCard
          label="Largest Team"
          value={summary.largestDepartment?._count?.employees ?? 0}
          sub={summary.largestDepartment ? summary.largestDepartment.name : "No teams yet"}
          accent="#7c3aed"
        />
      </div>

      {notice ? <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13 }}>{notice}</div> : null}
      {error ? <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>{error}</div> : null}

      {loading ? (
        <DepartmentSkeleton />
      ) : departments.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#94a3b8",
            borderRadius: 18,
            border: "1px dashed #cbd5e1",
            backgroundColor: "#fff",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: 800, color: "#334155", fontSize: 16 }}>No departments yet</p>
          <p style={{ margin: "0 auto", fontSize: 13, maxWidth: 420 }}>
            Create your first department to start grouping employees and make the admin area easier to navigate.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {departments.map((department) => (
            <div
              key={department.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 140px 190px",
                gap: 14,
                alignItems: "center",
                padding: "18px 20px",
                borderRadius: 18,
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                boxShadow: "0 12px 32px rgba(15,23,42,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1d4ed8",
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {department.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 800, color: "#334155" }}>{department.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    Created {new Date(department.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
                  {department._count.employees}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>assigned employees</p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Link
                  to={`/employees?departmentId=${department.id}`}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    textDecoration: "none",
                    color: "#1d4ed8",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  View employees
                </Link>
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => {
                        setEditingDepartment(department);
                        setShowModal(true);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#475569",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeDepartment(department)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: "1px solid #fecaca",
                        backgroundColor: "#fef2f2",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#b91c1c",
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal ? (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => setShowModal(false)}
          onSaved={load}
        />
      ) : null}
    </div>
  );
}
