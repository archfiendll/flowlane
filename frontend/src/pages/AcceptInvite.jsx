import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import api from "../api/client";

const passwordRules = [
  { label: "At least 10 characters", test: (p) => p.length >= 10 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function AcceptInvite() {
  const navigate = useNavigate();
  const { applySession } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  // Load invitation details on mount
  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }
    async function loadInvitation() {
      try {
        const res = await api.get(`/invitations/accept?token=${token}`);
        setEmail(res.data.data.invitation.email);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Invalid or expired invitation.");
      } finally {
        setLoading(false);
      }
    }
    loadInvitation();
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Accept the invitation
      await api.post("/invitations/accept", { token, password });
      // Auto-login
      const res = await api.post("/auth/login", { email, password });
      applySession(res.data.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
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
              Accept Invitation
            </p>
          </div>

          {/* Form body */}
          <div style={{ padding: "32px 32px 24px" }}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading invitation...</p>
            ) : error && !email ? (
              <div style={{
                padding: "10px 14px", backgroundColor: "#fef2f2",
                border: "1px solid #fecaca", borderRadius: 8,
                color: "#b91c1c", fontSize: 13,
              }}>{error}</div>
            ) : (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  Set up your account
                </h1>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>
                  You've been invited to join. Set your password to get started.
                </p>

                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Email address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{ ...inputStyle, backgroundColor: "#f1f5f9", color: "#94a3b8" }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "#1d6fc4"; setShowRules(true); }}
                      onBlur={e => e.target.style.borderColor = "#cbd5e1"}
                    />
                    {showRules && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                        {passwordRules.map(rule => {
                          const passed = rule.test(password);
                          return (
                            <div key={rule.label} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              fontSize: 12, color: passed ? "#16a34a" : "#94a3b8",
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
                      padding: "10px 14px", backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca", borderRadius: 8,
                      color: "#b91c1c", fontSize: 13,
                    }}>{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%", padding: "12px",
                      backgroundColor: submitting ? "#93c5fd" : "#1d6fc4",
                      color: "#fff", border: "none",
                      borderRadius: 8, fontSize: 14,
                      fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "Setting up account..." : "Accept invitation"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
