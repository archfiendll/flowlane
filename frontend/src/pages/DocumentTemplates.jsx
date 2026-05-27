import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { StatCard, StatusPill, SurfaceCard } from "../components/ui.jsx";

function TemplateSkeleton() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {Array.from({ length: 4 }, (_, index) => (
        <SurfaceCard
          key={index}
          style={{
            padding: "20px 22px",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ width: "32%", height: 18, borderRadius: 999, backgroundColor: "#e2e8f0" }} />
          <div style={{ width: "48%", height: 13, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
          <div style={{ width: "88%", height: 13, borderRadius: 999, backgroundColor: "#f8fafc" }} />
        </SurfaceCard>
      ))}
    </div>
  );
}

function buildTemplateDescription(key) {
  const descriptions = {
    "employment-contract": "Core employment agreement generated with company and employee contract data.",
    "job-description-assistant-manager": "Role-specific job description template for assistant manager positions.",
    "information-minute": "Internal HR acknowledgement and information record for onboarding workflows.",
    "employment-request": "Employment request document prepared from employee and company profile fields.",
    "gdpr-consent": "Data-processing consent template for employee records and compliance flows.",
    "health-insurance-declaration": "Health insurance declaration template using employee identity details.",
  };

  return descriptions[key] || "Built-in DOCX template available for employee document generation.";
}

function buildTemplateAudience(key) {
  if (key.includes("gdpr")) return "Compliance";
  if (key.includes("health")) return "HR Admin";
  if (key.includes("job-description")) return "Role Setup";
  return "Hiring";
}

export default function DocumentTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/employees/documents/templates");
        if (!cancelled) {
          setTemplates(res.data.data.templates ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error?.message || "Failed to load document templates.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const complianceTemplates = templates.filter((template) => template.key.includes("gdpr") || template.key.includes("health")).length;
    const contractTemplates = templates.filter((template) => template.key.includes("contract") || template.key.includes("employment")).length;

    return {
      total: templates.length,
      complianceTemplates,
      contractTemplates,
    };
  }, [templates]);

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
          <h1 style={{ margin: "0 0 8px 0", fontSize: 30, color: "#1e293b" }}>Document Templates</h1>
          <p style={{ margin: "0 0 14px 0", color: "#64748b", fontSize: 14, maxWidth: 680 }}>
            This library shows the HR DOCX templates currently available for employee document generation. Admins can use these templates from the employee drawer today, and this page gives us a clean home for future custom template uploads.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatusPill label="Admin area" tone="info" />
            <StatusPill label="Built-in templates" tone="success" />
            <StatusPill label="Custom upload next" tone="warning" />
          </div>
        </div>

        <SurfaceCard style={{ padding: "16px 18px", minWidth: 250 }}>
          <p style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 800, color: "#94a3b8", letterSpacing: "1.4px", textTransform: "uppercase" }}>
            Next Expansion
          </p>
          <p style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
            Custom template upload
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
            The current system uses static templates from the backend. The next step is storing template metadata and uploaded DOCX files so admins can manage them here.
          </p>
        </SurfaceCard>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Templates" value={summary.total} sub="Available for generation" accentColor="#1d4ed8" />
        <StatCard label="Contract Docs" value={summary.contractTemplates} sub="Hiring and employment flows" accentColor="#0f766e" />
        <StatCard label="Compliance Docs" value={summary.complianceTemplates} sub="Privacy and health paperwork" accentColor="#f59e0b" />
      </div>

      <SurfaceCard
        style={{
          padding: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
            Current generation flow
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Open an employee record, use the template chips in the drawer, and Flowlane will generate a DOCX file with that employee’s data.
          </p>
        </div>
        <Link
          to="/employees"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #bfdbfe",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Open Employees
        </Link>
      </SurfaceCard>

      {error ? (
        <div
          style={{
            padding: "12px 14px",
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

      {loading ? (
        <TemplateSkeleton />
      ) : templates.length === 0 ? (
        <SurfaceCard style={{ padding: 36, textAlign: "center" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: 17, fontWeight: 800, color: "#334155" }}>
            No document templates available
          </p>
          <p style={{ margin: "0 auto", fontSize: 13, color: "#64748b", maxWidth: 520 }}>
            The backend did not return any built-in templates. Once the template list is available again, this page will become the central library for admin document generation.
          </p>
        </SurfaceCard>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {templates.map((template) => (
            <SurfaceCard
              key={template.key}
              style={{
                padding: "20px 22px",
                display: "grid",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: "0 0 6px 0", fontSize: 20, color: "#1e293b" }}>{template.label}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                    {buildTemplateDescription(template.key)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <StatusPill label={buildTemplateAudience(template.key)} tone="info" />
                  <StatusPill label="Built-in" tone="success" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 220px) 1fr", gap: 12 }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    Template Key
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#334155" }}>{template.key}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                    Used For
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
                    Employee-level HR document generation with company, contract, identity, and employment fields already mapped in the backend service.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}
