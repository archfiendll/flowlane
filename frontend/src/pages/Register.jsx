import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

const passwordRules = [
  { label: "At least 10 characters", test: (p) => p.length >= 10 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      // Auto-login after register
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #cbd5e1",
    borderRadius: 8, fontSize: 14,
    color: "#1e293b", backgroundColor: "#f8fafc",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#64748b", letterSpacing: "1.5px",
    textTransform: "uppercase", marginBottom: 6,
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: "#f1f5f9", padding: "24px" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}>

          {/* Blue header */}
          <div style={{ backgroundColor: "#003580", padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40,
                backgroundColor: "#1d6fc4",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 18,
              }}>F</div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>Flowlane</span>
            </div>
            <p style={{ color: "#93c5fd", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
              HR Operations Platform
            </p>
          </div>

          {/* Form body */}
          <div style={{ padding: "32px 32px 24px" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
              Create account
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>
              Fill in your details to get started
            </p>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#1d6fc4"}
                  onBlur={e => e.target.style.borderColor = "#cbd5e1"}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={inputStyle}
                  onFocus={e => {
                    e.target.style.borderColor = "#1d6fc4";
                    setShowRules(true);
                  }}
                  onBlur={e => e.target.style.borderColor = "#cbd5e1"}
                />

                {/* Password rules — shown when focused */}
                {showRules && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {passwordRules.map(rule => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          fontSize: 12,
                          color: passed ? "#16a34a" : "#94a3b8",
                        }}>
                          <span style={{ fontSize: 14 }}>{passed ? "✓" : "○"}</span>
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && (
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#b91c1c", fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px",
                  backgroundColor: loading ? "#93c5fd" : "#1d6fc4",
                  color: "#fff", border: "none",
                  borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={e => { if (!loading) e.target.style.backgroundColor = "#1559a0"; }}
                onMouseLeave={e => { if (!loading) e.target.style.backgroundColor = "#1d6fc4"; }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 32px",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "#1d6fc4", fontWeight: 600, textDecoration: "none" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}