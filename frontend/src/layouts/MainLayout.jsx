import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

const NAV = [
  {
    path: "/dashboard", label: "Dashboard",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: "/employees", label: "Employees",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        backgroundColor: "#003580",
        display: "flex", flexDirection: "column",
        flexShrink: 0, transition: "width 0.2s ease",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 32, height: 32, backgroundColor: "#1d6fc4", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0,
          }}>F</div>
          {!collapsed && (
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>
              Flowlane
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: 10, padding: "10px 12px", borderRadius: 8,
                  marginBottom: 4, textDecoration: "none",
                  justifyContent: collapsed ? "center" : "flex-start",
                  backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
                  color: active ? "#fff" : "rgba(147,197,253,0.9)",
                  fontSize: 14, fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = active ? "rgba(255,255,255,0.15)" : "transparent"; }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: "12px 8px 16px", borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", backgroundColor: "#1d6fc4",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
          {!collapsed && user && (
            <div style={{ overflow: "hidden" }}>
              <p style={{
                color: "#fff", fontSize: 12, fontWeight: 600, margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130,
              }}>{user.email}</p>
              <p style={{ color: "#93c5fd", fontSize: 11, textTransform: "capitalize", margin: 0 }}>
                {user.role}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "0 24px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, position: "sticky", top: 0, zIndex: 10,
        }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#94a3b8", padding: 4, borderRadius: 4,
              display: "flex", alignItems: "center",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
              <span>{user?.email}</span>
              <span style={{
                padding: "2px 10px", backgroundColor: "#eff6ff", color: "#1d4ed8",
                borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize",
              }}>{user?.role}</span>
            </div>
            <button
              onClick={logout}
              style={{
                padding: "6px 16px", backgroundColor: "transparent",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#1d6fc4"; e.target.style.color = "#1d6fc4"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.color = "#475569"; }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}