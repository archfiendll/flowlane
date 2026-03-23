import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function PublicRoute({ children }) {
  const { defaultRoute, isAuthenticated, status } = useAuth();

  if (status === "restoring") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f1f5f9",
          color: "#64748b",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Restoring session...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}
