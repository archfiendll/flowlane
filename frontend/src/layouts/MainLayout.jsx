import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const NAV = [
  {
    path: "/dashboard", label: "Dashboard", roles: ['admin', 'manager', 'employee'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: "/employees", label: "Employees", roles: ['admin', 'manager'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    path: "/company-setup", label: "Company Setup", roles: ['admin', 'manager'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4 6 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" /></svg>,
  },
  {
    path: "/departments", label: "Departments", roles: ['admin', 'manager'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 21h16M6 18V7l6-4 6 4v11M10 10h.01M10 14h.01M14 10h.01M14 14h.01" /></svg>,
  },
  {
    path: "/vacations", label: "Vacations", roles: ['admin', 'manager', 'employee'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>,
  },
  {
    path: "/invitations", label: "Invitations", roles: ['admin', 'manager'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-16 9h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  },
  {
    path: "/document-templates", label: "Document Templates", roles: ['admin'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a2 2 0 01-2-2V5a2 2 0 012-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5M9 13h6M9 17h6M9 9h2" /></svg>,
  },
  {
    path: "/reports", label: "Reports", roles: ['admin'],
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19V5m0 14h16M8 16V10m4 6V7m4 9V12" /></svg>,
  },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";
  const isWideAdminPage = location.pathname === "/document-templates" || location.pathname === "/reports";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff" }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        backgroundColor: "#0f0f0f",
        display: "flex", flexDirection: "column",
        flexShrink: 0, transition: "width 0.2s ease",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
        <div style={{
            width: 32, height: 32, backgroundColor: "#1a1a1a", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0,
          }}>F</div>
          {!collapsed && (
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 16, whiteSpace: "nowrap" }}>
              Flowlane
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.filter(item => item.roles.includes(user?.role)).map(item => {
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
                  backgroundColor: "transparent",
                  color: active ? "#fff" : "#a0a0a0",
                  fontSize: 14, fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#a0a0a0"; }}
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
            width: 32, height: 32, borderRadius: "50%", backgroundColor: "#1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
          {!collapsed && user && (
            <div style={{ overflow: "hidden" }}>
              <p style={{
                color: "#fff", fontSize: 12, fontWeight: 500, margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130,
              }}>{user.email}</p>
              <p style={{ color: "#a0a0a0", fontSize: 11, textTransform: "capitalize", margin: 0 }}>
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
              color: "#6b6b6b", padding: 4, borderRadius: 4,
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
                padding: "2px 10px", backgroundColor: "#f5f5f5", color: "#111111",
                borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize",
              }}>{user?.role}</span>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
              style={{
                padding: "6px 16px", backgroundColor: "transparent",
                border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#111111"; e.target.style.color = "#111111"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.color = "#475569"; }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "40px", overflowY: "auto", backgroundColor: "#fff" }}>
          <div style={{ maxWidth: isWideAdminPage ? 1420 : 960, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
