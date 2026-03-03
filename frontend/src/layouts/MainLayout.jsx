import { Link, Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>Flowlane</div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 12 }}>
            <Link style={{ color: "#93c5fd" }} to="/dashboard">
              Dashboard
            </Link>
            <Link style={{ color: "#93c5fd" }} to="/employees">
              Employees
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <div style={{ opacity: 0.9 }}>
              {user.email} <span style={{ opacity: 0.7 }}>({user.role})</span>
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>Not logged in</div>
          )}

          <button
            onClick={logout}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page container */}
      <main style={{ padding: 24 }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}