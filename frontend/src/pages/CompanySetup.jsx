import { useEffect, useState } from "react";
import api from "../api/client";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  color: "#1e293b",
  backgroundColor: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: 6,
};

function Field({ label, children, hint }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint ? (
        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#94a3b8" }}>{hint}</p>
      ) : null}
    </div>
  );
}

function CompanySetupSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ width: 200, height: 30, borderRadius: 10, backgroundColor: "#e2e8f0", marginBottom: 10 }} />
        <div style={{ width: 320, height: 14, borderRadius: 999, backgroundColor: "#f1f5f9" }} />
      </div>
      {[1, 2].map((section) => (
        <section
          key={section}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ width: 180, height: 18, borderRadius: 999, backgroundColor: "#e2e8f0", marginBottom: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[...Array(6)].map((_, index) => (
              <div key={index} style={{ height: 42, borderRadius: 10, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  legalAddress: "",
  city: "",
  country: "Romania",
  email: "",
  bankName: "",
  iban: "",
  legalRepName: "",
  legalRepTitle: "",
  profileRO: {
    cui: "",
    caenCode: "",
    county: "",
    tradeRegister: "",
    vatPayer: false,
  },
};

export default function CompanySetup() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCompany = async (cancelledRef) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/company/me");
      const company = res.data.data.company;
      if (cancelledRef?.current) return;

      setForm({
        name: company.name ?? "",
        legalAddress: company.legalAddress ?? "",
        city: company.city ?? "",
        country: company.country ?? "Romania",
        email: company.email ?? "",
        bankName: company.bankName ?? "",
        iban: company.iban ?? "",
        legalRepName: company.legalRepName ?? "",
        legalRepTitle: company.legalRepTitle ?? "",
        profileRO: {
          cui: company.profileRO?.cui ?? "",
          caenCode: company.profileRO?.caenCode ?? "",
          county: company.profileRO?.county ?? "",
          tradeRegister: company.profileRO?.tradeRegister ?? "",
          vatPayer: Boolean(company.profileRO?.vatPayer),
        },
      });
    } catch (err) {
      if (!cancelledRef?.current) {
        setError(err.response?.data?.error?.message || "Failed to load company profile.");
      }
    } finally {
      if (!cancelledRef?.current) setLoading(false);
    }
  };

  useEffect(() => {
    const cancelledRef = { current: false };
    loadCompany(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setProfileField = (field) => (e) => {
    const value = field === "vatPayer" ? e.target.checked : e.target.value;
    setForm((current) => ({
      ...current,
      profileRO: { ...current.profileRO, [field]: value },
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        profileRO: {
          ...form.profileRO,
          vatPayer: Boolean(form.profileRO.vatPayer),
        },
      };

      const res = await api.put("/company/me", payload);
      const company = res.data.data.company;

      setForm((current) => ({
        ...current,
        name: company.name ?? current.name,
      }));
      setSuccess("Company profile saved.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CompanySetupSkeleton />;
  }

  if (error && !form.name && !form.legalAddress && !form.legalRepName) {
    return (
      <div style={{
        padding: "20px 24px",
        backgroundColor: "#fff7ed",
        border: "1px solid #fdba74",
        borderRadius: 12,
        color: "#9a3412",
      }}>
        <p style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700 }}>Unable to load company profile</p>
        <p style={{ margin: "0 0 14px 0", fontSize: 13 }}>{error}</p>
        <button
          type="button"
          onClick={() => loadCompany()}
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
          Company Setup
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Complete the legal and company details used across onboarding and HR workflows.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
              Core Company Details
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              These values identify the company and its legal representative.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Company Name *">
              <input style={inputStyle} value={form.name} onChange={setField("name")} required />
            </Field>
            <Field label="Country *">
              <input style={inputStyle} value={form.country} onChange={setField("country")} required />
            </Field>
            <Field label="Company Email">
              <input
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={setField("email")}
                placeholder="office@flowlane.ro"
              />
            </Field>
            <Field label="Legal Address *">
              <input
                style={inputStyle}
                value={form.legalAddress}
                onChange={setField("legalAddress")}
                required
              />
            </Field>
            <Field label="City *">
              <input style={inputStyle} value={form.city} onChange={setField("city")} required />
            </Field>
            <Field label="Legal Representative *">
              <input
                style={inputStyle}
                value={form.legalRepName}
                onChange={setField("legalRepName")}
                required
              />
            </Field>
            <Field label="Representative Title *">
              <input
                style={inputStyle}
                value={form.legalRepTitle}
                onChange={setField("legalRepTitle")}
                required
              />
            </Field>
            <Field label="Bank Name">
              <input style={inputStyle} value={form.bankName} onChange={setField("bankName")} />
            </Field>
            <Field label="IBAN">
              <input style={inputStyle} value={form.iban} onChange={setField("iban")} />
            </Field>
          </div>
        </section>

        <section
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
              Romanian Company Profile
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Optional, but useful for future contracts, compliance, and localized workflows.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="CUI" hint="If you add Romanian profile data, CUI, CAEN, and county are required together.">
              <input style={inputStyle} value={form.profileRO.cui} onChange={setProfileField("cui")} />
            </Field>
            <Field label="CAEN Code">
              <input
                style={inputStyle}
                value={form.profileRO.caenCode}
                onChange={setProfileField("caenCode")}
              />
            </Field>
            <Field label="County">
              <input
                style={inputStyle}
                value={form.profileRO.county}
                onChange={setProfileField("county")}
              />
            </Field>
            <Field label="Trade Register">
              <input
                style={inputStyle}
                value={form.profileRO.tradeRegister}
                onChange={setProfileField("tradeRegister")}
              />
            </Field>
          </div>

          <label
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#334155",
            }}
          >
            <input
              type="checkbox"
              checked={form.profileRO.vatPayer}
              onChange={setProfileField("vatPayer")}
            />
            VAT payer
          </label>
        </section>

        {(error || success) && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${error ? "#fecaca" : "#bbf7d0"}`,
              backgroundColor: error ? "#fef2f2" : "#f0fdf4",
              color: error ? "#b91c1c" : "#166534",
              fontSize: 13,
            }}
          >
            {error || success}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 18px",
              backgroundColor: saving ? "#93c5fd" : "#1d6fc4",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Company Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
